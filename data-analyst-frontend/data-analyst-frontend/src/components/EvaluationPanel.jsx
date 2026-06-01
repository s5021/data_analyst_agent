import './EvaluationPanel.css'

const VERDICT_META = {
  PASS:   { color: 'green', label: 'Pass',   icon: '✓' },
  REVIEW: { color: 'amber', label: 'Review', icon: '⚠' },
  FAIL:   { color: 'red',   label: 'Fail',   icon: '✕' },
}

const RISK_META = {
  LOW:     { color: 'green', label: 'Low risk'    },
  MEDIUM:  { color: 'amber', label: 'Medium risk' },
  HIGH:    { color: 'red',   label: 'High risk'   },
  UNKNOWN: { color: 'gray',  label: 'Unknown'     },
}

function ScoreBar({ score }) {
  const pct   = (score / 10) * 100
  const color = score >= 7 ? 'green' : score >= 4 ? 'amber' : 'red'
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-track">
        <div
          className={`score-bar-fill score-fill-${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`score-num score-num-${color}`}>{score}/10</span>
    </div>
  )
}

export default function EvaluationPanel({ evaluation, generatorModel, evaluatorModel }) {
  if (!evaluation) return null

  const { correctness, quality, hallucination, overall_verdict, summary } = evaluation
  const verdict = VERDICT_META[overall_verdict] || VERDICT_META.REVIEW
  const risk    = RISK_META[hallucination?.risk] || RISK_META.UNKNOWN

  return (
    <div className="eval-panel">

      <div className="eval-header">
        <div className="eval-title-row">
          <span className="eval-title">Phi-4 Evaluation Report</span>
          <span className={`eval-verdict eval-verdict-${verdict.color}`}>
            {verdict.icon} {verdict.label}
          </span>
        </div>
        <div className="eval-models-row">
          <span className="eval-model-tag">
            <span className="eval-model-dot dot-generator" />
            Generator: {generatorModel || 'GPT-4o'}
          </span>
          <span className="eval-model-tag">
            <span className="eval-model-dot dot-evaluator" />
            Evaluator: {evaluatorModel || 'Phi-4-mini-reasoning'}
          </span>
        </div>
      </div>

      <div className="eval-summary">{summary}</div>

      <div className="eval-metrics">

        <div className="eval-metric-card">
          <div className="eval-metric-label">Correctness</div>
          <ScoreBar score={correctness?.score ?? 0} />
          <div className="eval-metric-reason">{correctness?.reason}</div>
        </div>

        <div className="eval-metric-card">
          <div className="eval-metric-label">Quality</div>
          <ScoreBar score={quality?.score ?? 0} />
          <div className="eval-metric-reason">{quality?.reason}</div>
        </div>

        <div className={`eval-metric-card eval-hall-card eval-hall-${risk.color}`}>
          <div className="eval-metric-label">Hallucination check</div>
          <div className="eval-hall-row">
            <span className={`eval-risk-badge eval-risk-${risk.color}`}>
              {risk.label}
            </span>
            <span className="eval-hall-status">
              {hallucination?.detected
                ? '⚠ Detected'
                : '✓ None detected'}
            </span>
          </div>
          <div className="eval-metric-reason">{hallucination?.reason}</div>
        </div>

      </div>
    </div>
  )
}