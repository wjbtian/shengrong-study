export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function validateImage(file, maxSize = 10) {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: '只支持 JPG、PNG、GIF、WebP 格式' }
  }
  if (file.size > maxSize * 1024 * 1024) {
    return { valid: false, error: '图片大小不能超过 ' + maxSize + 'MB' }
  }
  return { valid: true }
}

export function validateVideo(file, maxSize = 100) {
  const validTypes = ['video/mp4', 'video/webm']
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: '只支持 MP4、WebM 格式' }
  }
  if (file.size > maxSize * 1024 * 1024) {
    return { valid: false, error: '视频大小不能超过 ' + maxSize + 'MB' }
  }
  return { valid: true }
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

export async function compressImage(file, quality = 0.8, maxWidth = 1920) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      let width = img.width
      let height = img.height
      
      if (width > maxWidth) {
        height = (maxWidth / width) * height
        width = maxWidth
      }
      
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, { type: 'image/jpeg' }))
      }, 'image/jpeg', quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}
