import axios from 'axios'
import conf from './conf'

// Session lives in httpOnly cookies set by the backend, so we only need withCredentials.
const api = axios.create({
  baseURL: conf.apiUrl,
  withCredentials: true,
  timeout: 30000,
})

// A separate client without interceptors, so a failing refresh can never loop.
const refreshClient = axios.create({
  baseURL: conf.apiUrl,
  withCredentials: true,
  timeout: 15000,
})

// These endpoints must never trigger a refresh (a wrong password is also a 401).
const NO_REFRESH = ['/users/login', '/users/register', '/users/refresh-token']

// The backend rotates refresh tokens, so two refreshes at once would break the
// second one. Every request that gets a 401 shares this one in-flight promise.
let refreshPromise = null

function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = refreshClient.post('/users/refresh-token').finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status

    const skip =
      status !== 401 ||
      !original ||
      original._retry ||
      NO_REFRESH.some((path) => original.url?.includes(path))

    if (skip) return Promise.reject(error)

    original._retry = true
    try {
      await refreshSession()
      return api(original)
    } catch {
      window.dispatchEvent(new Event('auth:expired'))
      return Promise.reject(error)
    }
  },
)

export default api
