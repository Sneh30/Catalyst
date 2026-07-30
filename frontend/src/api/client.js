import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password })
export const register = (email, password, name) => api.post('/auth/register', { email, password, name })
export const getMe = () => api.get('/auth/me')
export const updateMe = (data) => api.put('/auth/me', data)

// Resume
export const auditResume = (content, title) => api.post('/resume/audit', { content, title })
export const optimizeResume = (content) => api.post('/resume/optimize', { content })
export const matchResume = (jobId) => api.post(`/resume/match?job_id=${jobId}`)
export const generateResume = (job_id, job_title, company, job_description) =>
  api.post('/resume/generate', { job_id, job_title, company, job_description })
export const getGeneratedResumes = () => api.get('/resume/generated')
export const getGeneratedResume = (id) => api.get(`/resume/generated/${id}`)
export const acceptGeneratedResume = (id) => api.put(`/resume/generated/${id}/accept`)

// Jobs
export const searchJobs = (query, location = '', minSalary = 0, maxResults = 50) =>
  api.get('/jobs/search', { params: { query, location, min_salary: minSalary, max_results: maxResults } })
export const saveJobs = (jobs) => api.post('/jobs/save-batch', jobs)
export const getSavedJobs = (minMatch = 0) => api.get('/jobs/saved', { params: { min_match: minMatch } })
export const matchJob = (jobId) => api.post(`/jobs/${jobId}/match`)
export const markApplied = (jobId) => api.put(`/jobs/${jobId}/apply`)

// Content
export const generateContent = (contentType, sourceProject = '', topic = '', tone = 'professional') =>
  api.post('/content/generate', { content_type: contentType, source_project: sourceProject, topic, tone })
export const getContentHistory = () => api.get('/content/history')
export const getContent = (id) => api.get(`/content/${id}`)
export const updateContentStatus = (id, status) => api.put(`/content/${id}/status?status=${status}`)

// Tracker
export const saveWeekly = (metrics, achievements, missed, nextPriorities, notes) =>
  api.post('/tracker/weekly', { metrics, achievements, missed, next_priorities: nextPriorities, notes })
export const getWeekly = () => api.get('/tracker/weekly')
export const getCurrentWeek = () => api.get('/tracker/weekly/current')
export const generateWeeklyReview = () => api.post('/tracker/weekly/review')
