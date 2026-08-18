export function Ticker() {
  const bits = [
    "Show Me",
    "Where Dem Dollars At",
    "World of Grey",
    "Different Shades",
    "Tour Soon",
    "Loris to the World",
    "ASH is listening",
  ];
  const line = [...bits, ...bits];
  return (
    <div className="ticker" aria-hidden>
      <div className="ticker-track">
        {line.map((t, i) => (
          <span key={`${t}-${i}`}>✦ {t}</span>
        ))}
      </div>
    </div>
  );
}
