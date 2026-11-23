import api from '../conf/api'

// Backend wraps every success in { status_code, data, message, success }.

export async function registerUser(payload) {
  const res = await api.post('/users/register', payload)
  return res.data.data
}

// Tokens also come back in the body, but the session uses the httpOnly cookies,
// so only the user object is returned.
export async function loginUser(payload) {
  const res = await api.post('/users/login', payload)
  return res.data.data.user
}

export async function logoutUser() {
  await api.post('/users/logout')
}

export async function getCurrentUser() {
  const res = await api.get('/users/current-user')
  return res.data.data
}
