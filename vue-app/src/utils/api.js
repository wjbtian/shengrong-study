const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function api(method, path, data) {
  const opts = {
    method,
    headers: {}
  }
  if (data) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(data)
  }
  const res = await fetch(`${API_BASE}/api${path}`, opts)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const getDiary = () => api('GET', '/diary')
export const postDiary = (data) => api('POST', '/diary', data)
export const getShines = () => api('GET', '/shines')
export const getTech = () => api('GET', '/tech')
export const postTech = (data) => api('POST', '/tech', data)
export const putTechFav = (id) => api('PUT', `/tech/${id}/fav`)
export const deleteTech = (id) => api('DELETE', `/tech/${id}`)
export const getGuitar = () => api('GET', '/guitar')
export const postGuitar = (data) => api('POST', '/guitar', data)
export const getProgress = () => api('GET', '/progress')
export const postProgress = (data) => api('POST', '/progress', data)
