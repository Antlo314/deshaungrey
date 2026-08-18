"""
Cross removal for hero + Show Me plate.
Walls are vertical wood paneling, so each masked column is rebuilt from the
rows just above/below the mask (preserves seams + spotlight falloff), then
real high-frequency wall texture is layered back and the seam is feathered.
Writes to private/masters/retouch/*.png at source resolution.

Run:  python scripts/retouch.py
"""
import os
import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public", "media")
OUT = os.path.join(ROOT, "private", "masters", "retouch")
os.makedirs(OUT, exist_ok=True)


def column_fill(img, mask, band=14, gap=6, hsmooth=4, side="both"):
    """For each column with masked pixels, linearly interpolate between the
    mean of `band` rows above / below the run (skipping `gap` rows adjacent to
    the mask, which usually hold the object's shadow). Sample rows are lightly
    smoothed horizontally so single-column outliers don't streak."""
    src = img.astype(np.float32)
    # horizontally smoothed copy for sampling (keeps panel seams, kills specks)
    smooth = cv2.GaussianBlur(src, (0, 0), sigmaX=hsmooth, sigmaY=0.5)
    out = src.copy()
    h, w = mask.shape
    for x in range(w):
        col = mask[:, x]
        if not col.any():
            continue
        ys = np.where(col > 0)[0]
        runs = np.split(ys, np.where(np.diff(ys) > 1)[0] + 1)
        for run in runs:
            y0, y1 = run[0], run[-1]
            top = smooth[max(0, y0 - gap - band):max(0, y0 - gap), x]
            bot = smooth[min(h, y1 + 1 + gap):min(h, y1 + 1 + gap + band), x]
            if len(top) == 0 and len(bot) == 0:
                continue
            a = top.mean(axis=0) if len(top) else bot.mean(axis=0)
            b = bot.mean(axis=0) if len(bot) else top.mean(axis=0)
            if side == "top":
                b = a
            elif side == "bottom":
                a = b
            n = y1 - y0 + 1
            t = np.linspace(0, 1, n)[:, None]
            # ease so the glow falls off like the original spotlight
            t = t ** 1.15
            out[y0:y1 + 1, x] = a * (1 - t) + b * t
    return out


def row_fill(img, mask, band=14, gap=4, side="both", vsmooth=4):
    """Row-wise counterpart of column_fill: rebuild each masked row from the
    columns just left/right of the run. side='left' uses only the left sample
    (for when the right neighbour is a person, not wall)."""
    src = img.astype(np.float32)
    smooth = cv2.GaussianBlur(src, (0, 0), sigmaX=0.5, sigmaY=vsmooth)
    out = src.copy()
    h, w = mask.shape
    for y in range(h):
        row = mask[y]
        if not row.any():
            continue
        xs = np.where(row > 0)[0]
        runs = np.split(xs, np.where(np.diff(xs) > 1)[0] + 1)
        for run in runs:
            x0, x1 = run[0], run[-1]
            left = smooth[y, max(0, x0 - gap - band):max(0, x0 - gap)]
            right = smooth[y, min(w, x1 + 1 + gap):min(w, x1 + 1 + gap + band)]
            a = left.mean(axis=0) if len(left) else right.mean(axis=0)
            b = right.mean(axis=0) if len(right) else left.mean(axis=0)
            if side == "left":
                b = a
            elif side == "right":
                a = b
            n = x1 - x0 + 1
            t = np.linspace(0, 1, n)[None, :].T
            out[y, x0:x1 + 1] = a * (1 - t) + b * t
    return out


def add_texture(filled, img, mask, src_rows, strength=0.7):
    """Layer high-frequency wall grain back in. Texture is sampled from
    `src_rows` (y0, y1) in the SAME columns as the mask and tiled vertically
    only, so wood grain and panel seams stay continuous per column."""
    y0, y1 = src_rows
    patch = img[y0:y1].astype(np.float32)
    hf = patch - cv2.GaussianBlur(patch, (0, 0), 2.5)   # fine grain only, no banding
    hf = cv2.GaussianBlur(hf, (0, 0), 0.6)
    # mirror-tile vertically so tile boundaries are continuous
    hf = np.concatenate([hf, hf[::-1]], axis=0)
    H, W = mask.shape
    reps = int(np.ceil(H / hf.shape[0])) + 1
    tiled = np.tile(hf, (reps, 1, 1))[:H, :W]
    m = (mask > 0)[..., None]
    soft = cv2.GaussianBlur(filled, (0, 0), 1.2)
    return np.where(m, soft + tiled * strength, filled)


def blend(img, filled, mask, feather=9):
    m = cv2.GaussianBlur(mask.astype(np.float32) / 255.0, (0, 0), feather)
    m = np.clip(m * 1.4, 0, 1)[..., None]  # keep the core fully replaced
    core = (mask > 0)[..., None]
    m = np.where(core, 1.0, m)
    out = img.astype(np.float32) * (1 - m) + filled * m
    return np.clip(out, 0, 255).astype(np.uint8)


def poly_mask(shape, polys):
    m = np.zeros(shape[:2], np.uint8)
    for p in polys:
        cv2.fillPoly(m, [np.array(p, np.int32)], 255)
    return m


def process(name, src, polys, tex_rows, extra=None, tex_strength=0.7):
    """polys: list of (points, mode) where mode is 'v', 'h', 'h-left', 'h-right'."""
    img = cv2.imread(src, cv2.IMREAD_COLOR)
    assert img is not None, src
    filled = img.astype(np.float32).copy()
    full = np.zeros(img.shape[:2], np.uint8)
    for pts, mode in polys:
        m = poly_mask(img.shape, [pts])
        base = np.clip(filled, 0, 255).astype(np.uint8)  # later masks sample from earlier fills
        if mode in ("v", "v-top", "v-bottom"):
            f = column_fill(base, m, side={"v": "both", "v-top": "top", "v-bottom": "bottom"}[mode])
        else:
            side = {"h": "both", "h-left": "left", "h-right": "right"}[mode]
            f = row_fill(base, m, side=side)
        sel = (m > 0)[..., None]
        filled = np.where(sel, f, filled)
        full |= m
    mask = full
    filled = add_texture(filled, img, mask, tex_rows, strength=tex_strength)
    out = blend(img, filled, mask)
    if extra:
        out = extra(out)
    dst = os.path.join(OUT, name)
    cv2.imwrite(dst, out, [cv2.IMWRITE_PNG_COMPRESSION, 3])
    # debug crop
    ys, xs = np.where(mask > 0)
    pad = 60
    y0, y1 = max(0, ys.min() - pad), min(img.shape[0], ys.max() + pad)
    x0, x1 = max(0, xs.min() - pad), min(img.shape[1], xs.max() + pad)
    dbg = np.hstack([img[y0:y1, x0:x1], out[y0:y1, x0:x1]])
    cv2.imwrite(os.path.join(OUT, name.replace(".png", "-debug.jpg")), dbg, [cv2.IMWRITE_JPEG_QUALITY, 90])
    print("wrote", dst)


# ---- HERO (1280x720): ornate cross on the back wall ----
process(
    "hero-still.png",
    os.path.join(PUB, "hero", "hero-still.jpg"),
    polys=[
        # generous polygon around the cross incl. its shadow, inside the wall panel
        # arms + upper post, then only the lower post (his shoulder is bottom-left)
        ([(566, 128), (748, 128), (748, 405), (618, 405), (618, 296), (566, 296)], "v"),
    ],
    tex_rows=(50, 118),  # clean lit wall rows above the cross
)


# ---- SHOW ME plate (1280x720): gold cross behind him + framed cross at right ----
def showme_frame(out):
    """Fill the framed 'cross painting' interior with a smooth dark velvet
    reproduction of the frame's inner tone (Telea inpaint on a uniform area)."""
    m = np.zeros(out.shape[:2], np.uint8)
    cv2.rectangle(m, (868, 122), (972, 318), 255, -1)
    return cv2.inpaint(out, m, 7, cv2.INPAINT_TELEA)


process(
    "show-me.png",
    os.path.join(PUB, "plates", "show-me.jpg"),
    polys=[
        # upper post + arms: rebuild rows from the clean panel to the left/right
        ([(588, 22), (750, 22), (750, 132), (588, 132)], "h"),
        # lower post, left of his hairline (face begins ~x=668): left wall only
        ([(632, 130), (684, 130), (684, 296), (632, 296)], "v"),
        # the small cross symbol inside the picture frame at right (uniform panel)
        ([(872, 160), (938, 160), (938, 286), (872, 286)], "v"),
    ],
    tex_rows=(0, 21),  # clean wall strip above the cross
    tex_strength=0.45,
)


# ---- SHOW ME cover (2048x2048, official art): small cross symbol inside the frame ----
# Original is archived at private/masters/covers/show-me-original.jpg before publishing.
process(
    "show-me-cover.png",
    os.path.join(PUB, "covers", "show-me.jpg"),
    polys=[
        # cross symbol; polygon dodges his shoulder at the lower-left
        ([(1815, 435), (1935, 435), (1935, 732), (1892, 732), (1846, 650), (1815, 650)], "v-top"),
    ],
    tex_rows=(330, 420),  # plain frame interior above the symbol
    tex_strength=0.4,
)
