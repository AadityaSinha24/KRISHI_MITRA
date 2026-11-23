import api from '../conf/api'

export async function getMenu() {
  const res = await api.get('/prompt/menu')
  return res.data.data.menu
}

export async function getPrompt(key) {
  const res = await api.post('/prompt', { key })
  return res.data.data
}
