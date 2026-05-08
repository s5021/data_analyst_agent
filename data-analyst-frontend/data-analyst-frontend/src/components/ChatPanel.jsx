import { useState, useRef, useEffect } from 'react'
import { askQuestion } from '../services/api.js'
import './ChatPanel.css'

const SUGGESTIONS = [
  'Give me an executive summary of this dataset',
  'What are the top 3 risks or anomalies you see?',
  'Which column has the highest variance?',
  'Identify any trends or patterns in the data',
  'What are the key performance indicators?',
]

export default function ChatPanel({ fileId }) {
  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (question) => {
    const q = question || input.trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setLoading(true)
    try {
      const data = await askQuestion(fileId, q)
      setMessages(prev => [...prev, { role: 'ai', text: data.answer }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'error', text: 'Failed to get a response. Is the backend running?' }])
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="chat-panel">
      <div className="chat-topbar">
        <span className="chat-topbar-icon">◈</span>
        <span className="chat-topbar-title">Ask the Data Analyst Agent</span>
        <span className="chat-topbar-badge">GPT-4o</span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">⬡</div>
            <div className="chat-empty-title">Ask anything about your data</div>
            <div className="suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="suggestion-btn" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`msg msg-${msg.role}`} style={{ animationDelay: `${i * 0.03}s` }}>
            <div className="msg-label">
              {msg.role === 'user' ? 'YOU' : msg.role === 'ai' ? 'AGENT' : 'ERROR'}
            </div>
            <div className="msg-text">{msg.text}</div>
          </div>
        ))}

        {loading && (
          <div className="msg msg-ai">
            <div className="msg-label">AGENT</div>
            <div className="typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <textarea
          className="chat-textarea"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ask about trends, risks, summaries… (Enter to send)"
          rows={2}
          disabled={loading}
        />
        <button
          className="send-btn"
          onClick={() => send()}
          disabled={!input.trim() || loading}
        >
          {loading ? <span className="send-spinner" /> : '▶'}
        </button>
      </div>
    </div>
  )
}
