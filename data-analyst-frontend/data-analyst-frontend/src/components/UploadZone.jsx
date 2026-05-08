import { useState, useRef } from 'react'
import { uploadFile, getSummary } from '../services/api.js'
import './UploadZone.css'

export default function UploadZone({ onSuccess }) {
  const [dragging, setDragging] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [progress, setProgress] = useState('')
  const inputRef = useRef()

  const handleFile = async (file) => {
    if (!file) return
    setError(null)
    setLoading(true)
    setProgress('Uploading file...')
    try {
      const fileData = await uploadFile(file)
      setProgress('Analyzing dataset...')
      const summaryData = await getSummary(fileData.file_id)
      onSuccess(fileData, summaryData)
    } catch (e) {
      setError(e.response?.data?.detail || 'Upload failed. Make sure the backend is running.')
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const onInputChange = (e) => handleFile(e.target.files[0])

  return (
    <div className="upload-page">
      <div className="upload-header">
        <div className="upload-title">
          <span className="upload-title-accent">⬡</span> DataMind Analyst
        </div>
        <p className="upload-subtitle">
          Upload your dataset. The AI agent will analyze it, answer questions, and generate charts.
        </p>
      </div>

      <div
        className={`dropzone ${dragging ? 'dragging' : ''} ${loading ? 'loading' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.json"
          onChange={onInputChange}
          style={{ display: 'none' }}
        />

        {loading ? (
          <div className="upload-loading">
            <div className="spinner" />
            <div className="progress-text">{progress}</div>
          </div>
        ) : (
          <>
            <div className="dropzone-icon">◈</div>
            <div className="dropzone-title">Drop your dataset here</div>
            <div className="dropzone-sub">or click to browse</div>
            <div className="dropzone-formats">
              <span>CSV</span><span>Excel (.xlsx)</span><span>JSON</span>
            </div>
          </>
        )}
      </div>

      {error && <div className="upload-error">⚠ {error}</div>}

      <div className="upload-examples">
        <div className="examples-label">Supported datasets from your project:</div>
        <div className="example-chips">
          {['sales_data.csv', 'employee_performance.json', 'inventory.xlsx', 'finance_data.json'].map(f => (
            <div key={f} className="chip">{f}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
