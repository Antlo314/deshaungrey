import { merch } from "@/lib/catalog";
import { BuyButton } from "./BuyButton";

export function MerchGrid() {
  return (
    <section className="merch" id="merch">
      <div className="merch-head">
        <div>
          <p className="kicker">Wear the singles</p>
          <h2>
            The closet
            <br />
            of Grey.
          </h2>
        </div>
        <p style={{ color: "var(--mute)", maxWidth: 320, lineHeight: 1.6 }}>
          Two worlds. Printful plugs in tomorrow — the garments are already designed.
        </p>
      </div>
      <div className="grid">
        {merch.map((item) => (
          <article className="card" key={item.id}>
            <div className={`card-img ${item.kind === "poster" ? "poster" : ""}`}>
              <img src={item.image} alt={item.title} />
            </div>
            <div className="card-body">
              <p className="kicker">{item.world === "showme" ? "Show Me" : "Where Dem Dollars At"}</p>
              <h3>{item.title}</h3>
              <p>{item.blurb}</p>
              <div className="card-row">
                <span className="price">{item.price.label}</span>
                <BuyButton sku={item.sku} label="Notify" className="btn" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
