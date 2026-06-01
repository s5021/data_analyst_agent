import { useState, useRef, useEffect } from 'react'
import { askEvaluated } from '../services/api.js'
import EvaluationPanel from './EvaluationPanel.jsx'
import './ChatPanel.css'
import './EvaluateChat.css'

const SUGGESTIONS = [
  'What are the top 3 risks in this dataset?',
  'Give me an executive summary of this data',
  'Which metric has the highest variance?',
  'Identify any anomalies or outliers',
  'What trends are visible in the data?',
]

export default function EvaluateChat({ fileId }) {
  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
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
      const data = await askEvaluated(fileId, q)
      setMessages(prev => [...prev, {
        role:           'ai',
        text:           data.answer,
        evaluation:     data.evaluation,
        generatorModel: data.generator_model,
        evaluatorModel: data.evaluator_model,
      }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'error',
        text: e.response?.data?.detail || 'Request failed. Is the backend running?'
      }])
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
        <span className="chat-topbar-icon">⊕</span>
        <span className="chat-topbar-title">Multi-LLM Evaluation</span>
        <span className="eval-topbar-pills">
          <span className="eval-pill eval-pill-purple">GPT-4o generator</span>
          <span className="eval-pill eval-pill-green">Phi-4 evaluator</span>
        </span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">⊕</div>
            <div className="chat-empty-title">
              Ask a question — GPT-4o answers, Phi-4 evaluates
            </div>
            <div className="eval-empty-sub">
              Every response is independently scored for correctness,
              quality and hallucination by Phi-4-mini-reasoning
            </div>
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
          <div key={i} className={`msg msg-${msg.role}`}>
            <div className="msg-label">
              {msg.role === 'user'  && 'YOU'}
              {msg.role === 'ai'    && 'GPT-4o'}
              {msg.role === 'error' && 'ERROR'}
            </div>
            <div className="msg-text">{msg.text}</div>

            {msg.role === 'ai' && msg.evaluation && (
              <EvaluationPanel
                evaluation={msg.evaluation}
                generatorModel={msg.generatorModel}
                evaluatorModel={msg.evaluatorModel}
              />
            )}
          </div>
        ))}

        {loading && (
          <div className="eval-loading-state">
            <div className="eval-loading-row">
              <span className="eval-loading-dot dot-generator" />
              <span className="eval-loading-label">GPT-4o generating answer...</span>
            </div>
            <div className="eval-loading-row">
              <span className="eval-loading-dot dot-evaluator" />
              <span className="eval-loading-label">Phi-4 preparing evaluation...</span>
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
          placeholder="Ask a question — both LLMs respond (Enter to send)"
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