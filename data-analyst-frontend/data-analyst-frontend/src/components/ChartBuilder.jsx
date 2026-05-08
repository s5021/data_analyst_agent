import { useState } from 'react'
import { generateChart } from '../services/api.js'
import './ChartBuilder.css'

const CHART_TYPES = [
  { id: 'bar',     label: 'Bar',     icon: '▬', needsY: false },
  { id: 'line',    label: 'Line',    icon: '╱', needsY: true  },
  { id: 'scatter', label: 'Scatter', icon: '⊹', needsY: true  },
  { id: 'hist',    label: 'Histogram', icon: '▤', needsY: false },
  { id: 'pie',     label: 'Pie',     icon: '◕', needsY: false },
  { id: 'heatmap', label: 'Heatmap', icon: '▦', needsY: false },
]

export default function ChartBuilder({ fileId, summary }) {
  const columns   = summary ? Object.keys(summary.dtypes || {}) : []
  const [chartType, setChartType] = useState('bar')
  const [xCol,      setXCol]      = useState(columns[0] || '')
  const [yCol,      setYCol]      = useState(columns[1] || '')
  const [title,     setTitle]     = useState('My Chart')
  const [loading,   setLoading]   = useState(false)
  const [chartUrl,  setChartUrl]  = useState(null)
  const [error,     setError]     = useState(null)
  const [history,   setHistory]   = useState([])

  const selected = CHART_TYPES.find(c => c.id === chartType)

  const build = async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await generateChart(fileId, chartType, xCol, selected.needsY ? yCol : null, title)
      const url = data.url
      setChartUrl(url)
      setHistory(prev => [{ url, title, chartType, xCol, yCol }, ...prev].slice(0, 6))
    } catch (e) {
      setError(e.response?.data?.detail || 'Chart generation failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chart-builder">
      <div className="chart-topbar">
        <span className="chart-topbar-icon">◲</span>
        <span className="chart-topbar-title">Chart Builder</span>
        <span className="chart-topbar-badge">Matplotlib</span>
      </div>

      <div className="chart-body">
        <div className="chart-controls">
          <section className="ctrl-section">
            <div className="ctrl-label">Chart type</div>
            <div className="chart-type-grid">
              {CHART_TYPES.map(ct => (
                <button
                  key={ct.id}
                  className={`chart-type-btn ${chartType === ct.id ? 'active' : ''}`}
                  onClick={() => setChartType(ct.id)}
                >
                  <span className="ct-icon">{ct.icon}</span>
                  <span className="ct-label">{ct.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="ctrl-section">
            <div className="ctrl-label">Columns</div>
            <div className="ctrl-row">
              <div className="ctrl-field">
                <label>X axis</label>
                <select value={xCol} onChange={e => setXCol(e.target.value)}>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {selected?.needsY && (
                <div className="ctrl-field">
                  <label>Y axis</label>
                  <select value={yCol} onChange={e => setYCol(e.target.value)}>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>
          </section>

          <section className="ctrl-section">
            <div className="ctrl-label">Title</div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Chart title"
              style={{ width: '100%' }}
            />
          </section>

          <button
            className="build-btn"
            onClick={build}
            disabled={loading || !xCol}
          >
            {loading
              ? <><span className="btn-spinner" /> Generating...</>
              : '◲ Generate chart'}
          </button>

          {error && <div className="chart-error">⚠ {error}</div>}

          {history.length > 0 && (
            <section className="ctrl-section">
              <div className="ctrl-label">Recent charts</div>
              <div className="history-list">
                {history.map((h, i) => (
                  <button key={i} className="history-item" onClick={() => setChartUrl(h.url)}>
                    <span className="history-icon">◲</span>
                    <span className="history-title">{h.title}</span>
                    <span className="history-type">{h.chartType}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="chart-preview">
          {chartUrl ? (
            <div className="chart-result" style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="chart-result-header">
                <span className="chart-result-title">{title}</span>
                <a href={chartUrl} download className="download-btn">↓ Download</a>
              </div>
              <img src={chartUrl} alt={title} className="chart-img" />
            </div>
          ) : (
            <div className="chart-placeholder">
              <div className="placeholder-icon">◲</div>
              <div className="placeholder-text">Configure and generate a chart</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
