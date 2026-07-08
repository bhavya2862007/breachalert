const DATA_ICONS: Record<string, string> = {
  "Passwords": "🔑",
  "Email addresses": "✉️",
  "Phone numbers": "📱",
  "Credit cards": "💳",
  "Dates of birth": "🎂",
  "Physical addresses": "🏠",
};

export default function BreachTimeline({ breaches }: { breaches: any[] }) {
  if (!breaches.length)
    return <div className="empty">🎉 No breaches found. Your data looks safe!</div>;

  return (
    <section className="timeline">
      <h2>Breach Timeline</h2>
      {breaches.map((b) => (
        <article key={b.id} className={`breach-card risk-${b.risk}`}>
          <div className="breach-head">
            <span className={`badge ${b.risk}`}>{b.risk.toUpperCase()} RISK</span>
            <span className="breach-date">{b.breach_date}</span>
          </div>
          <h3>{b.title}</h3>
          <p className="desc">{b.description?.slice(0, 160)}…</p>

          <div className="leaked-data">
            <strong>Leaked data:</strong>
            <div className="chips">
              {b.data_classes.map((dc: string) => (
                <span key={dc} className="chip">
                  {DATA_ICONS[dc] ?? "⚠️"} {dc}
                </span>
              ))}
            </div>
          </div>

          <div className="advice">
            <strong>Recommended actions</strong>
            {b.advice.map((a: any, i: number) => (
              <div key={i} className={`advice-item ${a.severity}`}>
                <b>{a.title}</b>
                <p>{a.detail}</p>
                <button className="cta">{a.cta} →</button>
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}