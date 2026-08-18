import { honors } from "@/lib/catalog";
import { Laurel } from "./Laurel";

/** Awards-night band: the record, stated plainly and framed like a gala program. */
export function Honors() {
  return (
    <section className="honors" id="honors" aria-label="Honors">
      <div className="honors-spot" aria-hidden />
      <div className="honors-head reveal">
        <p className="kicker dot">The record · 2003 → now</p>
        <h2>
          The record
          <br />
          <em>speaks.</em>
        </h2>
      </div>
      <ol className="honors-grid">
        {honors.map((h, i) => (
          <li key={h.id} className="honor reveal" style={{ ["--d" as string]: `${0.08 * i}s` }}>
            <Laurel size={72}>
              <span className="honor-idx">{String(i + 1).padStart(2, "0")}</span>
            </Laurel>
            <h3>{h.title}</h3>
            <p className="honor-sub">{h.sub}</p>
            <p className="honor-detail">{h.detail}</p>
          </li>
        ))}
      </ol>
      <div className="honors-foot reveal">
        <span className="orn" aria-hidden />
        <span>Loris, South Carolina → the Billboard chart → World of Grey</span>
        <span className="orn" aria-hidden />
      </div>
    </section>
  );
}
