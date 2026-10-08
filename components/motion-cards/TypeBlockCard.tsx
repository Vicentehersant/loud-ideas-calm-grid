/** Type block: several Outfit sizes working together (replaces the "Ideas you can use" word tile). */
export default function TypeBlockCard() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white select-none [container-type:size]" style={{ borderRadius: "var(--radius-img)", padding: "8cqw" }}>
      <p className="font-semibold uppercase" style={{ fontSize: "3.6cqw", letterSpacing: "0.14em", color: "var(--red-700)" }}>
        Save · Plan · Make
      </p>
      <p className="font-semibold" style={{ fontSize: "13cqw", lineHeight: 0.98, letterSpacing: "-0.03em", color: "var(--neutral-900)", marginTop: "5cqw" }}>
        Ideas you can use.
      </p>
      <p style={{ fontSize: "6.4cqw", lineHeight: 1.2, color: "var(--neutral-900)", marginTop: "3cqw" }}>Find what sparks you.</p>
      <span aria-hidden className="block" style={{ width: "12cqw", height: "1cqw", background: "var(--red-700)", borderRadius: 999, marginTop: "5cqw" }} />
      <p style={{ fontSize: "3.8cqw", lineHeight: 1.35, color: "var(--neutral-600)", marginTop: "4cqw" }}>
        Saved by Maya to “Picnic ideas”
        <br />
        12 friends are planning it too.
      </p>
      <div className="mt-auto flex items-end justify-between">
        <span className="font-light" style={{ fontSize: "16cqw", lineHeight: 0.9, color: "var(--red-700)", letterSpacing: "-0.02em" }}>1.2k</span>
        <span className="font-medium" style={{ fontSize: "3.6cqw", color: "var(--neutral-600)" }}>saves this week</span>
      </div>
    </div>
  );
}
