import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import UploadZone from './components/UploadZone.jsx'
import DataSummary from './components/DataSummary.jsx'
import ChatPanel from './components/ChatPanel.jsx'
import ChartBuilder from './components/ChartBuilder.jsx'
import './App.css'

export default function App() {
  const [uploadedFile, setUploadedFile] = useState(null)   // { file_id, filename }
  const [summary, setSummary]           = useState(null)
  const [activeTab, setActiveTab]       = useState('chat') // 'chat' | 'chart' | 'summary'

  const handleUploadSuccess = (fileData, summaryData) => {
    setUploadedFile(fileData)
    setSummary(summaryData)
    setActiveTab('chat')
  }

  const handleReset = () => {
    setUploadedFile(null)
    setSummary(null)
    setActiveTab('chat')
  }

  return (
    <div className="app-shell">
      <Sidebar
        uploadedFile={uploadedFile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReset={handleReset}
      />

      <main className="main-content">
        {!uploadedFile ? (
          <UploadZone onSuccess={handleUploadSuccess} />
        ) : (
          <div className="tab-content">
            {activeTab === 'chat'    && <ChatPanel    fileId={uploadedFile.file_id} />}
            {activeTab === 'chart'   && <ChartBuilder fileId={uploadedFile.file_id} summary={summary} />}
            {activeTab === 'summary' && <DataSummary  summary={summary} fileId={uploadedFile.file_id} />}
          </div>
        )}
      </main>
    </div>
  )
}
