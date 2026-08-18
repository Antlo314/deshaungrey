"""
Cross removal — hero plate, Show Me plate, Show Me cover.

Reads the ARCHIVED ORIGINALS (private/masters/originals/) so it is idempotent and
never double-processes. Writes to private/masters/retouch/, which enhance-4k.mjs
then upscales.

Algorithm (three stages, no generative fill — faces are never touched):

  1. Harmonic (Laplace) fill, solved multigrid.
     Solves the membrane equation inside the mask with the surrounding pixels as a
     Dirichlet boundary. Because the boundary is satisfied exactly, there is no
     rectangle edge, and because it is a true 2-D solve there is none of the
     per-column banding a 1-D interpolation produces.

  2. Seam profile, multiplicative.
     These walls are vertical paneling, so their texture is nearly invariant in y:
     a 1-D profile over x (seams + wood grain), sampled from clean donor rows in the
     SAME columns, is broadcast down the fill. Multiplicative so seam contrast tracks
     the local brightness instead of banding the shadows.

  3. Matched grain, then a feathered composite.
     Sensor noise sampled from real wall nearby, so the patch is not smoother than
     its surroundings — smoothness is what reads as "off pixels".

Run:  python scripts/retouch.py
"""
import os

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIG = os.path.join(ROOT, "private", "masters", "originals")
OUT = os.path.join(ROOT, "private", "masters", "retouch")
os.makedirs(OUT, exist_ok=True)

rng = np.random.default_rng(7)


# ----------------------------------------------------------------- masks
def poly_mask(shape, polys):
    m = np.zeros(shape[:2], np.uint8)
    for p in polys:
        cv2.fillPoly(m, [np.array(p, np.int32)], 255)
    return m


def _kern(k):
    return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k * 2 + 1,) * 2)


def gold_mask(img, box, dilate=5, close=7, clip_right=True):
    """Auto-detect the gilt cross inside `box` by hue, solidify it, and dilate to
    catch the anti-aliased fringe.

    Where the cross is occluded by a person, the correct boundary is exactly the
    person's silhouette — impossible to hand-trace reliably. `clip_right` therefore
    refuses to write any pixel to the right of that row's right-most gold pixel, so
    the mask stops at his hairline and never paints skin or hair.
    """
    x0, y0, x1, y1 = box
    sub = img[y0:y1, x0:x1]
    hsv = cv2.cvtColor(sub, cv2.COLOR_BGR2HSV)
    H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    core = (((H >= 8) & (H <= 38) & (S >= 45) & (V >= 55)).astype(np.uint8)) * 255

    g = cv2.morphologyEx(core, cv2.MORPH_CLOSE, _kern(close))
    cnts, _ = cv2.findContours(g, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(g, cnts, -1, 255, -1)          # solid, including dark crevices
    g = cv2.dilate(g, _kern(dilate))

    if clip_right:
        for row in range(g.shape[0]):
            hits = np.where(core[row] > 0)[0]
            g[row, (hits.max() + 1) if hits.size else 0:] = 0

    m = np.zeros(img.shape[:2], np.uint8)
    m[y0:y1, x0:x1] = g
    return m


def build_mask(img, remove, protect=(), grow=0, auto=()):
    """Union of `remove` polygons and `auto` gold-detected boxes, minus `protect`."""
    m = poly_mask(img.shape, remove)
    if grow:
        m = cv2.dilate(m, _kern(grow))
    for box in auto:
        m |= gold_mask(img, box)
    if protect:
        p = poly_mask(img.shape, protect)
        m[p > 0] = 0
    return m


# ----------------------------------------------------------------- stage 1
def _jacobi(f, unknown, iters):
    """In-place Gauss-Seidel-ish Jacobi sweeps on the unknown pixels."""
    u = unknown[..., None] if f.ndim == 3 else unknown
    for _ in range(iters):
        pad = cv2.copyMakeBorder(f, 1, 1, 1, 1, cv2.BORDER_REPLICATE)
        avg = (pad[:-2, 1:-1] + pad[2:, 1:-1] + pad[1:-1, :-2] + pad[1:-1, 2:]) * 0.25
        f = np.where(u, avg, f)
    return f


def laplace_fill(img, mask, levels=6, base_iters=90):
    """Multigrid harmonic fill. Coarse levels carry the low frequencies cheaply,
    fine levels sharpen the boundary match."""
    src = img.astype(np.float32)
    pyr_img, pyr_mask = [src], [(mask > 0)]
    for _ in range(levels - 1):
        small_img = cv2.pyrDown(pyr_img[-1])
        small_mask = cv2.pyrDown(pyr_mask[-1].astype(np.float32)) > 0.02  # grow unknown
        if min(small_img.shape[:2]) < 8:
            break
        pyr_img.append(small_img)
        pyr_mask.append(small_mask)

    # coarsest: seed unknown with the mean of the known pixels at that level
    f = pyr_img[-1].copy()
    m = pyr_mask[-1]
    known = ~m
    if known.any():
        f[m] = pyr_img[-1][known].mean(axis=0)
    f = _jacobi(f, m, base_iters * 6)

    # refine down the pyramid
    for lvl in range(len(pyr_img) - 2, -1, -1):
        target, m = pyr_img[lvl], pyr_mask[lvl]
        up = cv2.resize(f, (target.shape[1], target.shape[0]), interpolation=cv2.INTER_CUBIC)
        f = np.where(m[..., None], up, target)  # known pixels are always the truth
        f = _jacobi(f, m, base_iters * (2 if lvl else 4))
    return f


# ----------------------------------------------------------------- stage 2
def seam_profile(img, donor_rows, sigma_x=9.0):
    """1-D multiplicative texture over x (panel seams + vertical grain), averaged
    over clean donor rows. Returns an array of shape (1, W, 3) centred on 1.0."""
    y0, y1 = donor_rows
    patch = img[y0:y1].astype(np.float32) + 1.0
    base = cv2.GaussianBlur(patch, (0, 0), sigmaX=sigma_x, sigmaY=0.6)
    ratio = patch / np.maximum(base, 1.0)
    prof = ratio.mean(axis=0, keepdims=True)
    return cv2.GaussianBlur(prof, (0, 0), sigmaX=0.8, sigmaY=0.01)


def grain_sigma(img, rect):
    """Per-channel noise sigma measured off a real, clean patch of the same wall."""
    x0, y0, x1, y1 = rect
    patch = img[y0:y1, x0:x1].astype(np.float32)
    resid = patch - cv2.GaussianBlur(patch, (0, 0), 1.0)
    return resid.reshape(-1, 3).std(axis=0)


# ----------------------------------------------------------------- composite
def composite(img, filled, mask, feather=2.5):
    """Feathered blend. The interior is fully replaced; the feather only softens the
    last couple of pixels, since the harmonic solve already matches the boundary."""
    a = cv2.GaussianBlur((mask > 0).astype(np.float32), (0, 0), feather)[..., None]
    out = img.astype(np.float32) * (1 - a) + filled * a
    return np.clip(out, 0, 255).astype(np.uint8)


def process(name, src, remove, donor_rows, grain_rect, protect=(), grow=2, auto=(),
            seam_strength=1.0, grain_strength=1.0, ramp=9.0, extra=None):
    img = cv2.imread(src, cv2.IMREAD_COLOR)
    assert img is not None, src
    mask = build_mask(img, remove, protect, grow, auto)

    filled = laplace_fill(img, mask)

    # Texture must ramp in from the mask edge. The harmonic solve already matches
    # the boundary exactly; multiplying a seam profile over the whole patch would
    # re-apply texture the original pixels already have and reintroduce a visible
    # vertical edge at the mask border — which is exactly what a "remnant" looks like.
    dist = cv2.distanceTransform((mask > 0).astype(np.uint8), cv2.DIST_L2, 5)
    w = np.clip(dist / float(ramp), 0.0, 1.0)[..., None]

    prof = seam_profile(img, donor_rows)
    filled = filled * (1.0 + (prof - 1.0) * seam_strength * w)

    sig = grain_sigma(img, grain_rect) * grain_strength
    noise = rng.normal(0.0, 1.0, filled.shape).astype(np.float32)
    noise = cv2.GaussianBlur(noise, (0, 0), 0.55)
    noise /= max(noise.std(), 1e-6)
    filled = filled + noise * sig * w

    out = composite(img, filled, mask)
    if extra:
        out = extra(out)

    cv2.imwrite(os.path.join(OUT, name), out, [cv2.IMWRITE_PNG_COMPRESSION, 3])

    # side-by-side proof at 1:1
    ys, xs = np.where(mask > 0)
    pad = 70
    y0, y1 = max(0, ys.min() - pad), min(img.shape[0], ys.max() + pad)
    x0, x1 = max(0, xs.min() - pad), min(img.shape[1], xs.max() + pad)
    gap = np.zeros((y1 - y0, 8, 3), np.uint8)
    dbg = np.hstack([img[y0:y1, x0:x1], gap, out[y0:y1, x0:x1]])
    cv2.imwrite(os.path.join(OUT, name.replace(".png", "-debug.jpg")), dbg,
                [cv2.IMWRITE_JPEG_QUALITY, 94])

    # mask preview so the geometry can be checked by eye
    prev = img.copy()
    prev[mask > 0] = (0.45 * prev[mask > 0] + 0.55 * np.array([60, 60, 255])).astype(np.uint8)
    cv2.imwrite(os.path.join(OUT, name.replace(".png", "-mask.jpg")),
                prev[y0:y1, x0:x1], [cv2.IMWRITE_JPEG_QUALITY, 90])
    print("wrote", name)


# ============================================================ HERO (1280x720)
# Ornate gold cross on vertical wood paneling, with a spotlight halo behind it.
# The halo is kept (it reads as a wall wash); only the cross and its drop shadow go.
# His jacket enters from the lower left, so the mask stair-steps clear of it.
process(
    "hero-still.png",
    os.path.join(ORIG, "hero__hero-still.jpg"),
    remove=[
        # rectangle over cross + halo + drop shadow; the left edge stair-steps up
        # following his jacket silhouette with ~10px of clearance
        [(556, 112), (784, 112), (784, 434),
         (650, 434), (640, 410), (631, 392), (623, 372), (615, 352),
         (609, 332), (601, 312), (593, 290), (583, 268), (575, 246),
         (570, 200), (556, 190)],
    ],
    donor_rows=(72, 116),        # clean wall directly above the cross, same columns
    grain_rect=(560, 60, 750, 115),
    seam_strength=1.0,
)


# ====================================================== SHOW ME plate (1280x720)
# Gold cross on the back wall (his head overlaps its lower right), plus a small
# cross inside the framed print at right.
process(
    "show-me.png",
    os.path.join(ORIG, "plates__show-me.jpg"),
    remove=[
        # finial + upper post + arms — entirely above his head (hair crown is y~127)
        [(584, 12), (740, 12), (740, 124), (584, 124)],
        # the cross motif inside the framed print at right
        [(872, 170), (922, 170), (922, 292), (872, 292)],
    ],
    # lower post: occluded by his hair, so let hue find the true edge
    auto=[(628, 118, 706, 278)],
    donor_rows=(0, 15),          # thin strip of clean wall above the finial
    grain_rect=(750, 20, 860, 90),
    seam_strength=0.85,
)


# ================================================ SHOW ME cover (2048x2048 art)
# Only the small cross motif inside the framed print. Original art is archived.
process(
    "show-me-cover.png",
    os.path.join(ORIG, "covers__show-me.jpg"),
    remove=[
        [(1812, 430), (1938, 430), (1938, 742), (1888, 742), (1848, 660), (1812, 660)],
    ],
    donor_rows=(330, 425),       # plain frame interior above the motif
    grain_rect=(1815, 330, 1935, 425),
    seam_strength=0.5,
)
