// 日记数据管理
import { ref, computed } from 'vue'
import { getDiary, postDiary, putDiary, deleteDiary } from '../utils/api.js'

// 心情配置
export const moodConfig = {
  happy: { icon: '😊', label: '开心', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  excited: { icon: '🤩', label: '兴奋', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  calm: { icon: '😌', label: '平静', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  worried: { icon: '😟', label: '担心', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' },
  sad: { icon: '😢', label: '难过', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)' },
  angry: { icon: '😤', label: '生气', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
}

export const moodKeys = Object.keys(moodConfig)

export function useDiary() {
  const diary = ref([])
  const loading = ref(false)

  // 筛选
  const currentFilter = ref('all')
  const selectedMood = ref(null)

  const moodDistribution = computed(() => {
    const stats = {}
    diary.value.forEach(d => {
      const mood = d.mood || 'happy'
      stats[mood] = (stats[mood] || 0) + 1
    })
    const total = Object.values(stats).reduce((a, b) => a + b, 0)
    return Object.entries(stats).map(([mood, count]) => {
      const cfg = moodConfig[mood] || { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', icon: '❓', label: '未知' }
      return { ...cfg, mood, count, percent: total > 0 ? Math.round(count / total * 100) : 0 }
    })
  })

  // 分页
  const pageSize = 10
  const currentPage = ref(1)
  const hasMore = computed(() => currentPage.value * pageSize < filteredDiary.value.length)

  const filteredDiary = computed(() => {
    let items = [...diary.value].sort((a, b) => new Date(b.date) - new Date(a.date))
    if (selectedMood.value) {
      items = items.filter(d => d.mood === selectedMood.value)
    }
    return items
  })

  const pagedDiary = computed(() => filteredDiary.value.slice(0, currentPage.value * pageSize))

  // 统计
  const streak = computed(() => {
    const dates = [...new Set(diary.value.map(d => d.date))].sort().reverse()
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

  const thisMonth = computed(() => {
    const month = new Date().toISOString().slice(0, 7)
    return diary.value.filter(d => d.date?.startsWith(month)).length
  })

  // 心情墙
  const moodWallItems = computed(() => {
    const months = {}
    const now = new Date()
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toISOString().slice(0, 7)
      const monthData = diary.value.filter(e => e.date?.startsWith(key))
      const moodCounts = {}
      monthData.forEach(e => {
        const m = e.mood || 'happy'
        moodCounts[m] = (moodCounts[m] || 0) + 1
      })
      const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]
      months[key] = {
        month: key,
        count: monthData.length,
        mood: dominantMood ? dominantMood[0] : 'happy',
        icon: dominantMood ? moodConfig[dominantMood[0]].icon : '📝'
      }
    }
    return Object.values(months).reverse()
  })

  const filters = [
    { value: null, label: '全部' },
    ...moodKeys.map(k => ({ value: k, label: `${moodConfig[k].icon} ${moodConfig[k].label}` }))
  ]

  // 工具函数
  function selectMood(mood) {
    selectedMood.value = mood
    currentPage.value = 1
  }

  function getMoodStyle(moodKey) {
    const cfg = moodConfig[moodKey]
    return { color: cfg.color, background: cfg.bg }
  }

  function getMoodIcon(moodKey) {
    return moodConfig[moodKey]?.icon || '❓'
  }

  function getMoodColor(moodKey) {
    return moodConfig[moodKey]?.color || '#94a3b8'
  }

  function getMoodLabel(moodKey) {
    return moodConfig[moodKey]?.label || '未知'
  }

  // 加载
  async function load() {
    loading.value = true
    try {
      diary.value = await getDiary()
    } catch (e) {
      console.error('加载日记失败:', e)
    } finally {
      loading.value = false
    }
  }

  // 保存
  async function save(data) {
    const result = await postDiary(data)
    diary.value.unshift(result)
    return result
  }

  // 更新
  async function update(id, data) {
    const result = await putDiary(id, data)
    const idx = diary.value.findIndex(d => d.id === id)
    if (idx !== -1) diary.value[idx] = result
    return result
  }

  // 删除
  async function remove(id) {
    await deleteDiary(id)
    diary.value = diary.value.filter(d => d.id !== id)
  }

  function loadMore() {
    if (hasMore.value) currentPage.value++
  }

  return {
    diary,
    loading,
    currentFilter,
    selectedMood,
    moodDistribution,
    pagedDiary,
    hasMore,
    filteredDiary,
    streak,
    thisMonth,
    moodWallItems,
    filters,
    moodConfig,
    selectMood,
    getMoodStyle,
    getMoodIcon,
    getMoodColor,
    getMoodLabel,
    load,
    save,
    update,
    remove,
    loadMore
  }
}