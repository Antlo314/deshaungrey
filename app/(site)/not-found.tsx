import Link from "next/link";

export default function NotFound() {
  return (
    <section className="notfound">
      <div>
        <b>404</b>
        <p className="kicker dot" style={{ marginTop: 20 }}>
          Not on the roster
        </p>
        <p className="lede" style={{ marginTop: 14, marginInline: "auto" }}>
          That page doesn&apos;t exist — or it moved when the label did.
        </p>
        <Link href="/" className="btn solid">
          Back to MEG
        </Link>
      </div>
    </section>
  );
}
