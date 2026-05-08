import axios from 'axios'

const api = axios.create({ baseURL: '' })

export const uploadFile = async (file) => {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/api/upload/', form)
  return data
}

export const getSummary = async (fileId) => {
  const { data } = await api.get(`/api/analyze/summary/${fileId}`)
  return data
}

export const askQuestion = async (fileId, question) => {
  const { data } = await api.post('/api/analyze/ask', { file_id: fileId, question })
  return data
}

export const generateChart = async (fileId, chartType, xCol, yCol, title) => {
  const { data } = await api.post('/api/charts/generate', {
    file_id: fileId,
    chart_type: chartType,
    x_col: xCol,
    y_col: yCol || null,
    title
  })
  return data
}
