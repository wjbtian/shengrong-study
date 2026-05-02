/**
 * 上传文件到服务器
 * @param {File} file - 要上传的文件
 * @param {string} type - 文件类型 ('image' | 'video')
 * @returns {Promise<string>} 上传后的文件URL
 */
export async function uploadFile(file, type = 'image') {
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

/**
 * 将文件转换为 Base64
 * @param {File} file - 要转换的文件
 * @returns {Promise<string>} Base64 字符串
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 压缩图片
 * @param {File} file - 原始图片文件
 * @param {number} maxWidth - 最大宽度
 * @param {number} quality - 压缩质量 (0-1)
 * @returns {Promise<Blob>} 压缩后的图片 Blob
 */
export function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => resolve(blob),
        file.type || 'image/jpeg',
        quality
      )
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片加载失败'))
    }
    
    img.src = url
  })
}
