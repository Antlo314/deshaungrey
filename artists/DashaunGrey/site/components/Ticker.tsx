export function Ticker() {
  const bits = [
    "Show Me",
    "Where Dem Dollars At",
    "World of Grey",
    "Different Shades",
    "Tour Soon",
    "Loris to the World",
    "ASH is listening",
    "Billboard Hot R&B",
    "Grammy Ballot 2011",
    "MEG Enterprises",
  ];
  const line = [...bits, ...bits];
  return (
    <div className="ticker" aria-hidden>
      <div className="ticker-track">
        {line.map((t, i) => (
          <span key={`${t}-${i}`} className={i % 2 ? "o" : ""}>
            <b className="star">✦</b>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
