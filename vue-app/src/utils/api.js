const API_BASE = ''

// 统一的请求处理
async function request(method, path, data, options = {}) {
  const { retries = 1, timeout = 10000 } = options
  
  const opts = {
    method,
    headers: {},
    signal: AbortSignal.timeout(timeout)
  }
  
  if (data && !(data instanceof FormData)) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(data)
  } else if (data) {
    opts.body = data
  }
  
  let lastError
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(`${API_BASE}/api${path}`, opts)
      
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error')
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }
      
      // 处理空响应
      const contentType = res.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await res.json()
      }
      return await res.text()
    } catch (e) {
      lastError = e
      if (i < retries) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)))
      }
    }
  }
  
  throw lastError
}

// API 方法
export const api = request

export const getDiary = () => request('GET', '/diary')
export const postDiary = (data) => request('POST', '/diary', data)
export const putDiary = (id, data) => request('PUT', `/diary/${id}`, data)
export const deleteDiary = (id) => request('DELETE', `/diary/${id}`)

export const getShines = () => request('GET', '/shines')
export const postShine = (data) => request('POST', '/shines', data)
export const updateShine = (id, data) => request('PUT', `/shines/${id}`, data)
export const deleteShine = (id) => request('DELETE', `/shines/${id}`)

export const getTech = () => request('GET', '/tech')
export const postTech = (data) => request('POST', '/tech', data)
export const putTechFav = (id) => request('PUT', `/tech/${id}/fav`)
export const deleteTech = (id) => request('DELETE', `/tech/${id}`)

export const getGuitar = () => request('GET', '/guitar')
export const postGuitar = (data) => request('POST', '/guitar', data)

export const getProgress = () => request('GET', '/progress')
export const postProgress = (data) => request('POST', '/progress', data)

// 上传文件
export const uploadFile = async (file, type = 'image') => {
  if (!file) return ''
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!res.ok) {
      throw new Error(`上传失败: HTTP ${res.status}`)
    }
    
    const data = await res.json()
    return data.url || data.photoUrl || data.videoUrl || ''
  } catch (e) {
    console.error('文件上传失败:', e)
    throw e
  }
}
