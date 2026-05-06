// 首页数据计算 - 活跃度图表、心情统计、学习进度、复习提醒
import { computed } from 'vue'

export function useHomeData(diary, shines, guitar, progress) {
  // 统计
  const stats = computed(() => ({
    diary: diary.value.length,
    shines: shines.value.length,
    guitar: guitar.value.length,
  }))

  // 学习进度
  const subjects = computed(() => {
    const doneUnits = progress.value?.doneUnits || []
    const doneOM = progress.value?.doneOM || []
    const getDone = (prefix) => doneUnits.filter(u => u.startsWith(prefix)).length

    return [
      { key: 'chinese', name: '语文', icon: '📖', color: '#4ade80', completed: getDone('chinese_'), total: 8 },
      { key: 'math', name: '数学', icon: '🔢', color: '#60a5fa', completed: getDone('math_'), total: 6 },
      { key: 'english', name: '英语', icon: '🔤', color: '#f472b6', completed: getDone('english_'), total: 6 },
      { key: 'olympiad', name: '奥数', icon: '🧩', color: '#fbbf24', completed: doneOM.length, total: 20 },
    ].map(s => ({ ...s, percent: Math.round((s.completed / s.total) * 100) }))
  })

  // 活跃度图表
  const activityData = computed(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      days.push(d.toISOString().split('T')[0])
    }
    const dayLabels = ['一', '二', '三', '四', '五', '六', '日']
    const today = new Date().getDay()

    return days.map((date, idx) => {
      const dCount = diary.value.filter(d => d.date === date).length
      const sCount = shines.value.filter(s => s.date === date).length
      const gCount = guitar.value.filter(g => g.date === date).length
      const maxH = 100
      const dayIndex = (today - 6 + idx + 7) % 7
      const label = dayLabels[dayIndex === 0 ? 6 : dayIndex - 1]

      return {
        label,
        isToday: idx === 6,
        diaryHeight: dCount ? Math.max(4, Math.min(maxH, (dCount / 3) * maxH)) : 0,
        shineHeight: sCount ? Math.max(4, Math.min(maxH, (sCount / 3) * maxH)) : 0,
        guitarHeight: gCount ? Math.max(4, Math.min(maxH, (gCount / 3) * maxH)) : 0,
      }
    })
  })

  // 心情数据
  const moodData = computed(() => diary.value.filter(d => d.mood))

  const recentMoods = computed(() => {
    return moodData.value.slice(0, 7).map(d => ({
      mood: d.mood,
      date: d.date.slice(5)
    }))
  })

  const moodDistribution = computed(() => {
    const stats = {}
    moodData.value.forEach(d => { stats[d.mood] = (stats[d.mood] || 0) + 1 })
    const total = moodData.value.length
    const colors = {
      '😊': '#4ade80', '😄': '#22c55e', '🤩': '#16a34a', '😎': '#15803d',
      '🥳': '#86efac', '😐': '#94a3b8', '😔': '#64748b', '😢': '#475569',
      '😭': '#334155', '😤': '#f87171', '😴': '#cbd5e1'
    }
    return Object.entries(stats)
      .map(([mood, count]) => ({ mood, count, percent: Math.round((count / total) * 100), color: colors[mood] || '#94a3b8' }))
      .sort((a, b) => b.count - a.count)
  })

  // 艾宾浩斯复习
  const reviews = computed(() => {
    const doneUnits = progress.value?.doneUnits || []
    if (!doneUnits.length) return []
    const today = new Date().toISOString().split('T')[0]
    const intervals = [1, 2, 4, 7, 15, 30]
    const reviews = []
    doneUnits.forEach(unitId => {
      const completedDate = progress.value?.unitDates?.[unitId] || today
      const daysSince = Math.floor((new Date(today) - new Date(completedDate)) / 86400000)
      intervals.forEach((interval, idx) => {
        if (daysSince === interval) {
          const subject = unitId.startsWith('chinese_') ? '语文' : unitId.startsWith('math_') ? '数学' : unitId.startsWith('english_') ? '英语' : '其他'
          reviews.push({
            id: unitId + '_' + interval,
            subject,
            title: `第${unitId.split('_')[1]}单元`,
            stage: `第${idx + 1}次复习`,
            stageType: idx < 2 ? 'success' : idx < 4 ? 'warning' : 'danger'
          })
        }
      })
    })
    return reviews
  })

  return { stats, subjects, activityData, moodData, recentMoods, moodDistribution, reviews }
}

// 问候语
export function useGreeting() {
  const greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 6) return '夜深了'
    if (hour < 9) return '早上好'
    if (hour < 12) return '上午好'
    if (hour < 14) return '中午好'
    if (hour < 18) return '下午好'
    return '晚上好'
  })

  const todayDate = computed(() => {
    const d = new Date()
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${d.getMonth() + 1}月${d.getDate()}日 ${days[d.getDay()]}`
  })

  // 每日一句
  const quotes = [
    { text: '千里之行，始于足下。', author: '老子' },
    { text: '学而时习之，不亦说乎？', author: '孔子' },
    { text: '天才就是百分之一的灵感加上百分之九十九的汗水。', author: '爱迪生' },
    { text: '书山有路勤为径，学海无涯苦作舟。', author: '韩愈' },
    { text: '不积跬步，无以至千里；不积小流，无以成江海。', author: '荀子' },
    { text: '知之者不如好之者，好之者不如乐之者。', author: '孔子' },
    { text: '业精于勤，荒于嬉；行成于思，毁于随。', author: '韩愈' },
    { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
    { text: '宝剑锋从磨砺出，梅花香自苦寒来。', author: '古诗' },
    { text: '少年易老学难成，一寸光阴不可轻。', author: '朱熹' },
  ]

  const dailyQuote = computed(() => {
    const idx = new Date().getDate() % quotes.length
    return quotes[idx]
  })

  return { greeting, todayDate, dailyQuote }
}
