import Link from "next/link";

export default function RootNotFound() {
  return (
    <section className="notfound">
      <div>
        <b>404</b>
        <p className="kicker dot" style={{ marginTop: 20 }}>
          Not on the roster
        </p>
        <Link href="/" className="btn solid">
          Back to MEG
        </Link>
      </div>
    </section>
  );
}
