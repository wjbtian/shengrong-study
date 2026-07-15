// 闪光时刻数据管理
import { ref, computed } from 'vue'
import { getShines, postShine, deleteShine, updateShine, uploadFile } from '../utils/api.js'

// 分类定义
export const categories = [
  { value: 'award', label: '🏆 获奖', icon: '🏆' },
  { value: 'sport', label: '⚽ 运动', icon: '⚽' },
  { value: 'art', label: '🎨 艺术', icon: '🎨' },
  { value: 'talent', label: '🎸 才艺', icon: '🎸' },
  { value: 'progress', label: '📈 进步', icon: '📈' },
  { value: 'other', label: '💫 其他', icon: '💫' },
]

// 筛选选项
export const filters = [
  { value: 'all', label: '全部' },
  ...categories.map(c => ({ value: c.value, label: c.label }))
]

export function useShines() {
  const shines = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 筛选
  const currentFilter = ref('all')
  const filteredShines = computed(() => {
    if (currentFilter.value === 'all') return shines.value
    return shines.value.filter(s => s.category === currentFilter.value)
  })

  // 统计
  const favCount = computed(() => shines.value.filter(s => s.fav).length)
  
  const streak = computed(() => {
    const dates = [...new Set(shines.value.map(s => s.date))].sort().reverse()
    if (!dates.length) return 0
    let count = 1
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1])
      const curr = new Date(dates[i])
      if ((prev - curr) / 86400000 === 1) count++
      else break
    }
    return count
  })

  // 图标映射
  function categoryIcon(category) {
    const map = { award: '🏆', sport: '⚽', art: '🎨', talent: '🎸', progress: '📈', other: '💫' }
    return map[category] || '✨'
  }

  // 加载
  async function load() {
    loading.value = true
    error.value = null
    try {
      shines.value = await getShines()
    } catch (e) {
      error.value = e.message
      console.error('加载失败:', e)
    } finally {
      loading.value = false
    }
  }

  // 保存新闪光
  async function saveShine(data) {
    loading.value = true
    try {
      const result = await postShine(data)
      shines.value.unshift(result)
      return result
    } finally {
      loading.value = false
    }
  }

  // 更新
  async function update(id, data) {
    const result = await updateShine(id, data)
    const idx = shines.value.findIndex(s => s.id === id)
    if (idx !== -1) shines.value[idx] = result
    return result
  }

  // 删除
  async function remove(id) {
    await deleteShine(id)
    shines.value = shines.value.filter(s => s.id !== id)
  }

  // 切换收藏
  async function toggleFav(item) {
    const newFav = !item.fav
    await updateShine(item.id, { fav: newFav })
    item.fav = newFav
  }

  // 上传文件
  async function uploadPhoto(file) {
    return await uploadFile(file, 'image')
  }

  return {
    shines,
    loading,
    error,
    currentFilter,
    filteredShines,
    favCount,
    streak,
    categoryIcon,
    categories,
    filters,
    load,
    saveShine,
    update,
    remove,
    toggleFav,
    uploadPhoto,
  }
}