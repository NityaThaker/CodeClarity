import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const login = (data) => api.post('/login', data)
export const register = (data) => api.post('/register', data)

// Assignments
export const getAssignments = () => api.get('/assignments')
export const getMyAssignments = () => api.get('/assignments/mine')
export const getAssignment = (id) => api.get(`/assignments/${id}`)
export const createAssignment = (data) => api.post('/assignments', data)
export const updateAssignment = (id, data) => api.put(`/assignments/${id}`, data)
export const deleteAssignment = (id) => api.delete(`/assignments/${id}`)
export const publishAssignment = (id) => api.post(`/assignments/${id}/publish`)
export const createRequirement = (id, data) => api.post(`/assignments/${id}/requirements`, data)
export const createTestCase = (id, data) => api.post(`/requirements/${id}/testcases`, data)

// Submissions
export const submitCode = (data) => api.post('/submissions', data)
export const getSubmissionResults = (id) => api.get(`/submissions/${id}/results`)

// Hints
export const requestHint = (submissionId, requirementId) =>
  api.post('/hints', null, { params: { submission_id: submissionId, requirement_id: requirementId } })
export const getHints = (submissionId) => api.get(`/hints/${submissionId}`)

// Analytics
export const getStudentAnalytics = () => api.get('/analytics/student/me')
export const getAssignmentAnalytics = (id) => api.get(`/analytics/instructor/${id}`)
export const getInstructorOverview = () => api.get('/analytics/instructor/overview')

// Code Analysis
export const getCodeAnalysis = (submissionId) => api.get(`/submissions/${submissionId}/analysis`)
export default api
