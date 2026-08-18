import { label } from "@/lib/catalog";

/** MEG Enterprises — the label behind the artist. Copy from the company bio. */
export function Label() {
  return (
    <section className="label" id="label">
      <div className="label-bg" aria-hidden>MEG</div>
      <div className="label-grid">
        <div>
          <p className="kicker dot reveal">The label · Independent since day one</p>
          <h2 className="reveal" style={{ ["--d" as string]: "0.08s" }}>
            MEG
            <br />
            <em>Enterprises.</em>
          </h2>
          <div className="label-num reveal" style={{ ["--d" as string]: "0.14s" }}>
            <b className="metal-text">{label.years}</b>
            <span>{label.yearsLabel}</span>
          </div>
          <p className="reveal" style={{ ["--d" as string]: "0.2s" }}>{label.intro}</p>
          <p className="reveal" style={{ ["--d" as string]: "0.26s" }}>{label.approach}</p>
        </div>
        <div>
          <p className="kicker reveal" style={{ marginBottom: 14 }}>The track record</p>
          <ul className="credits">
            {label.credits.map((c, i) => (
              <li key={c.t} className="reveal" style={{ ["--d" as string]: `${0.06 * i}s` }}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <span className="t">{c.t}</span>
                <span className="s">{c.s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="label-quote">
        <div className="reveal">
          <p className="kicker" style={{ marginBottom: 14 }}>The next generation · 2019</p>
          <h3>
            More than music. <em>Building legacy.</em>
          </h3>
        </div>
        <div className="reveal" style={{ ["--d" as string]: "0.12s" }}>
          <p>{label.nextGen}</p>
          <div className="founder">
            <i aria-hidden>G</i>
            <div>
              <b>{label.founder}</b>
              <small>{label.founderRole}</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
