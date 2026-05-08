import './DataSummary.css'

export default function DataSummary({ summary }) {
  if (!summary) return null

  const { shape, columns, dtypes, null_counts, sample, describe } = summary
  const [rows, cols] = shape || [0, 0]

  return (
    <div className="summary-panel">
      <div className="summary-topbar">
        <span className="summary-topbar-icon">◫</span>
        <span className="summary-topbar-title">Dataset Summary</span>
        <span className="summary-topbar-badge">Pandas</span>
      </div>

      <div className="summary-body">

        <div className="stat-cards">
          <StatCard label="Total rows"    value={rows.toLocaleString()} />
          <StatCard label="Total columns" value={cols} />
          <StatCard label="Null values"   value={Object.values(null_counts || {}).reduce((a,b) => a+b, 0)} accent="warn" />
          <StatCard label="Columns"       value={columns?.length} />
        </div>

        <Section title="Column types">
          <div className="dtype-grid">
            {columns?.map(col => (
              <div key={col} className="dtype-row">
                <span className="dtype-col">{col}</span>
                <span className="dtype-type">{dtypes?.[col]}</span>
                <span className={`dtype-null ${(null_counts?.[col] || 0) > 0 ? 'has-null' : ''}`}>
                  {null_counts?.[col] || 0} nulls
                </span>
              </div>
            ))}
          </div>
        </Section>

        {sample && sample.length > 0 && (
          <Section title="Sample rows (first 5)">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>{columns?.map(c => <th key={c}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {sample.map((row, i) => (
                    <tr key={i}>
                      {columns?.map(c => (
                        <td key={c}>{String(row[c] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {describe && (
          <Section title="Statistical description">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Stat</th>
                    {Object.keys(describe).map(c => <th key={c}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {['count','mean','std','min','25%','50%','75%','max'].map(stat => {
                    const hasData = Object.values(describe).some(col => col[stat] !== undefined && col[stat] !== '')
                    if (!hasData) return null
                    return (
                      <tr key={stat}>
                        <td className="stat-name">{stat}</td>
                        {Object.values(describe).map((col, i) => (
                          <td key={i}>
                            {typeof col[stat] === 'number'
                              ? col[stat].toFixed(2)
                              : String(col[stat] ?? '—')}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Section>
        )}

      </div>
    </div>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`stat-card ${accent ? `stat-card-${accent}` : ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="summary-section">
      <div className="section-title">{title}</div>
      {children}
    </section>
  )
}
