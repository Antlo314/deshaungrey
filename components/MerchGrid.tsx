"use client";

import { useState } from "react";
import { merch } from "@/lib/catalog";
import { BuyButton } from "./BuyButton";

type Filter = "all" | "showme" | "wtda";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "showme", label: "Show Me" },
  { id: "wtda", label: "Where Dem Dollars At" },
];

export function MerchGrid() {
  const [f, setF] = useState<Filter>("all");
  const shown = merch.filter((m) => f === "all" || m.world === f);

  return (
    <section className="merch" id="merch">
      <div className="merch-head">
        <div>
          <p className="kicker dot reveal">Wear the singles</p>
          <h2 className="reveal" style={{ ["--d" as string]: "0.08s" }}>
            The closet
            <br />
            of Grey.
          </h2>
        </div>
        <p className="reveal" style={{ ["--d" as string]: "0.16s" }}>
          Two worlds, six pieces. Burgundy and gold foil for Show Me. Newsprint and pink for Where Dem Dollars At.
        </p>
      </div>

      <div className="filters reveal" role="tablist" aria-label="Filter merch">
        {FILTERS.map((x) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={f === x.id}
            className={f === x.id ? "on" : ""}
            onClick={() => setF(x.id)}
          >
            {x.label}
          </button>
        ))}
        <span className="count">{shown.length} pieces</span>
      </div>

      <div className="grid">
        {merch.map((item, i) => {
          const hidden = f !== "all" && item.world !== f;
          return (
            <article
              className={`card reveal ${hidden ? "hide" : ""}`}
              key={item.id}
              style={{ ["--d" as string]: `${(i % 3) * 0.08}s` }}
            >
              <div className={`card-img ${item.kind === "poster" ? "poster" : ""}`}>
                <span className={`card-tag ${item.world}`}>{item.world === "showme" ? "Show Me" : "WTDA"}</span>
                <img
                  src={item.imageMobile}
                  srcSet={`${item.imageMobile} 900w, ${item.image} 2048w`}
                  sizes="(max-width: 419px) 100vw, (max-width: 900px) 50vw, 33vw"
                  alt={item.title}
                  loading="lazy"
                />
                <div className="card-quick">
                  <BuyButton sku={item.sku} label={`Notify · ${item.price.label}`} className="btn" />
                </div>
              </div>
              <div className="card-body">
                <p className="kicker">{item.kind}</p>
                <h3>{item.title}</h3>
                <p>{item.blurb}</p>
                <div className="card-row">
                  <span className="price">{item.price.label}</span>
                  {item.kind === "poster" ? (
                    <span className="sizes"><span>18×24</span></span>
                  ) : (
                    <span className="sizes" aria-label="Sizes">
                      {["S", "M", "L", "XL"].map((s) => <span key={s}>{s}</span>)}
                    </span>
                  )}
                  <span className="only-mobile-buy">
                    <BuyButton sku={item.sku} label="Notify" className="btn" />
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="merch-foot reveal">
        <span>Printed on demand · Ships worldwide</span>
        <span>Checkout wires next — notify to reserve your size</span>
      </div>
    </section>
  );
}
