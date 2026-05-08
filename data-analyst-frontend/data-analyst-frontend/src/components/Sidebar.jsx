import './Sidebar.css'

const tabs = [
  { id: 'chat',    icon: '◈', label: 'Ask AI' },
  { id: 'chart',   icon: '◲', label: 'Charts' },
  { id: 'summary', icon: '◫', label: 'Summary' },
]

export default function Sidebar({ uploadedFile, activeTab, setActiveTab, onReset }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">DataMind</span>
        </div>
        <div className="logo-sub">Azure AI Foundry</div>
      </div>

      <div className="sidebar-file">
        {uploadedFile ? (
          <div className="file-badge">
            <div className="file-badge-icon">◼</div>
            <div className="file-badge-info">
              <div className="file-badge-name">{uploadedFile.filename}</div>
              <div className="file-badge-status">
                <span className="dot" /> Active dataset
              </div>
            </div>
            <button className="file-reset-btn" onClick={onReset} title="Remove file">✕</button>
          </div>
        ) : (
          <div className="file-empty">No dataset loaded</div>
        )}
      </div>

      <nav className="sidebar-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''} ${!uploadedFile ? 'disabled' : ''}`}
            onClick={() => uploadedFile && setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
            {activeTab === tab.id && <span className="nav-pip" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="agent-badge">
          <span className="agent-dot" />
          <span>GPT-4o Agent</span>
        </div>
        <div className="sidebar-footer-sub">Azure AI Foundry</div>
      </div>
    </aside>
  )
}
