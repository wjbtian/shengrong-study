// 徽章系统 - 成就徽章定义 + 计算逻辑
import { computed } from 'vue'

const ALL_BADGES = [
  { id: 'first_diary', icon: '📝', name: '初识笔墨', desc: '写下第一篇日记', check: (d) => d?.length >= 1 },
  { id: 'diary_10', icon: '📄', name: '日积月累', desc: '累计10篇日记', check: (d) => d?.length >= 10 },
  { id: 'diary_30', icon: '📚', name: '笔耕不辍', desc: '累计30篇日记', check: (d) => d?.length >= 30 },
  { id: 'diary_60', icon: '📖', name: '日记达人', desc: '累计60篇日记', check: (d) => d?.length >= 60 },
  { id: 'diary_100', icon: '🏆', name: '文思泉涌', desc: '累计100篇日记', check: (d) => d?.length >= 100 },
  { id: 'diary_365', icon: '👑', name: '年度记录者', desc: '累计365篇日记', check: (d) => d?.length >= 365 },
  { id: 'first_shine', icon: '✨', name: '闪光初现', desc: '记录第一个闪光时刻', check: (s) => s?.length >= 1 },
  { id: 'shine_10', icon: '🌟', name: '星光点点', desc: '累计10个闪光时刻', check: (s) => s?.length >= 10 },
  { id: 'shine_30', icon: '🌠', name: '星光璀璨', desc: '累计30个闪光时刻', check: (s) => s?.length >= 30 },
  { id: 'shine_50', icon: '🎆', name: '闪耀全场', desc: '累计50个闪光时刻', check: (s) => s?.length >= 50 },
  { id: 'shine_100', icon: '💫', name: '传奇时刻', desc: '累计100个闪光时刻', check: (s) => s?.length >= 100 },
  { id: 'first_guitar', icon: '🎸', name: '弦音初鸣', desc: '完成第一次吉他练习', check: (g) => g?.length >= 1 },
  { id: 'guitar_10', icon: '🎵', name: '渐入佳境', desc: '累计10次吉他练习', check: (g) => g?.length >= 10 },
  { id: 'guitar_30', icon: '🎶', name: '音乐之路', desc: '累计30次吉他练习', check: (g) => g?.length >= 30 },
  { id: 'guitar_50', icon: '🎤', name: '吉他高手', desc: '累计50次吉他练习', check: (g) => g?.length >= 50 },
  { id: 'guitar_100', icon: '🎼', name: '音乐大师', desc: '累计100次吉他练习', check: (g) => g?.length >= 100 },
  { id: 'first_tech', icon: '🔬', name: '科技先锋', desc: '收藏第一条科技新闻', check: (t) => t?.length >= 1 },
  { id: 'tech_10', icon: '🔭', name: '探索者', desc: '累计10条科技新闻', check: (t) => t?.length >= 10 },
  { id: 'tech_30', icon: '🚀', name: '未来探索者', desc: '累计30条科技新闻', check: (t) => t?.length >= 30 },
  { id: 'tech_50', icon: '🛸', name: '星际旅行者', desc: '累计50条科技新闻', check: (t) => t?.length >= 50 },
  { id: 'tech_100', icon: '🌌', name: '宇宙智者', desc: '累计100条科技新闻', check: (t) => t?.length >= 100 },
  { id: 'week_streak', icon: '🔥', name: '持之以恒', desc: '连续7天有记录', check: (d, s, g) => checkStreak(d, s, g, 7) },
  { id: 'month_streak', icon: '⚡', name: '坚持不懈', desc: '连续30天有记录', check: (d, s, g) => checkStreak(d, s, g, 30) },
  { id: 'quarter_streak', icon: '🌞', name: '日出而作', desc: '连续90天有记录', check: (d, s, g) => checkStreak(d, s, g, 90) },
  { id: 'year_streak', icon: '🌅', name: '全年无休', desc: '连续365天有记录', check: (d, s, g) => checkStreak(d, s, g, 365) },
  { id: 'first_subject', icon: '📖', name: '学有所成', desc: '完成第一个学习单元', check: (d, s, g, t, p) => (p?.doneUnits || []).length >= 1 },
  { id: 'half_chinese', icon: '📜', name: '语文小能手', desc: '语文完成50%', check: (d, s, g, t, p) => checkSubjectProgress(p, 'chinese_', 4, 8) },
  { id: 'full_chinese', icon: '📿', name: '语文大师', desc: '语文全部完成', check: (d, s, g, t, p) => checkSubjectProgress(p, 'chinese_', 8, 8) },
  { id: 'half_math', icon: '🔢', name: '数学小能手', desc: '数学完成50%', check: (d, s, g, t, p) => checkSubjectProgress(p, 'math_', 3, 6) },
  { id: 'full_math', icon: '🧮', name: '数学大师', desc: '数学全部完成', check: (d, s, g, t, p) => checkSubjectProgress(p, 'math_', 6, 6) },
  { id: 'half_english', icon: '🔤', name: '英语小能手', desc: '英语完成50%', check: (d, s, g, t, p) => checkSubjectProgress(p, 'english_', 3, 6) },
  { id: 'full_english', icon: '🌍', name: '英语大师', desc: '英语全部完成', check: (d, s, g, t, p) => checkSubjectProgress(p, 'english_', 6, 6) },
  { id: 'olympiad_5', icon: '🧩', name: '奥数新手', desc: '完成5个奥数专题', check: (d, s, g, t, p) => (p?.doneOM || []).length >= 5 },
  { id: 'olympiad_10', icon: '🎯', name: '奥数高手', desc: '完成10个奥数专题', check: (d, s, g, t, p) => (p?.doneOM || []).length >= 10 },
  { id: 'olympiad_20', icon: '🏅', name: '奥数冠军', desc: '完成全部20个奥数专题', check: (d, s, g, t, p) => (p?.doneOM || []).length >= 20 },
  { id: 'all_subjects', icon: '📊', name: '全面发展', desc: '所有科目都有进度', check: (d, s, g, t, p) => {
    const done = p?.doneUnits || []
    return done.some(u => u.startsWith('chinese_')) && done.some(u => u.startsWith('math_')) && done.some(u => u.startsWith('english_')) && (p?.doneOM || []).length > 0
  }},
  { id: 'early_bird', icon: '🐦', name: '早起的鸟', desc: '早上8点前写日记', check: (d) => d?.some(i => new Date(i.created || i.date).getHours() < 8) },
  { id: 'night_owl', icon: '🦉', name: '夜猫子', desc: '晚上10点后写日记', check: (d) => d?.some(i => new Date(i.created || i.date).getHours() >= 22) },
  { id: 'weekend_warrior', icon: '🎉', name: '周末战士', desc: '周六日都有记录', check: (d, s, g) => {
    const allDates = new Set([...(d||[]), ...(s||[]), ...(g||[])].map(i => i.date))
    const hasSat = [...allDates].some(d => new Date(d).getDay() === 6)
    const hasSun = [...allDates].some(d => new Date(d).getDay() === 0)
    return hasSat && hasSun
  }},
  { id: 'mood_master', icon: '😄', name: '乐天派', desc: '连续10篇日记都是好心情', check: (d) => {
    if (!d || d.length < 10) return false
    const goodMoods = ['😊','😄','🤩','😎','🥳']
    return d.slice(-10).every(i => goodMoods.includes(i.mood))
  }},
  { id: 'collector', icon: '🏆', name: '收藏家', desc: '解锁10个成就徽章', check: (d, s, g, t, p, unlocked) => unlocked >= 10 },
  { id: 'master', icon: '💎', name: '成就大师', desc: '解锁25个成就徽章', check: (d, s, g, t, p, unlocked) => unlocked >= 25 },
  { id: 'legend', icon: '👑', name: '传奇人物', desc: '解锁全部成就徽章', check: (d, s, g, t, p, unlocked, total) => unlocked >= total },
]

function checkStreak(d, s, g, targetDays) {
  const allDates = new Set()
  ;[...(d||[]), ...(s||[]), ...(g||[])].forEach(i => { if (i.date) allDates.add(i.date) })
  const sorted = [...allDates].sort()
  if (sorted.length < targetDays) return false
  let streak = 1, maxStreak = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000
    if (diff === 1) { streak++; maxStreak = Math.max(maxStreak, streak) }
    else streak = 1
  }
  return maxStreak >= targetDays
}

function checkSubjectProgress(progress, prefix, target, total) {
  return (progress?.doneUnits || []).filter(u => u.startsWith(prefix)).length >= target
}

export function useBadges(diary, shines, guitar, tech, progress) {
  const badges = computed(() => {
    const d = diary.value, s = shines.value, g = guitar.value, t = tech.value, p = progress.value
    let unlocked = 0
    const result = ALL_BADGES.map(badge => {
      const isUnlocked = badge.check(d, s, g, t, p, 0, ALL_BADGES.length)
      if (isUnlocked) unlocked++
      return { ...badge, unlocked: isUnlocked }
    })
    result.forEach(badge => {
      if (['collector', 'master', 'legend'].includes(badge.id)) {
        badge.unlocked = badge.check(d, s, g, t, p, unlocked, ALL_BADGES.length)
      }
    })
    return result
  })

  const visibleBadges = computed(() => {
    const unlocked = badges.value.filter(b => b.unlocked)
    const locked = badges.value.filter(b => !b.unlocked)
    const visible = [...unlocked]
    if (locked.length > 0) {
      const mysteryCount = Math.min(3, locked.length)
      for (let i = 0; i < mysteryCount; i++) {
        visible.push({ id: `mystery_${i}`, icon: '❓', name: '???', desc: '达成特定条件后解锁', unlocked: false, isMystery: true })
      }
    }
    return visible
  })

  const unlockedBadges = computed(() => badges.value.filter(b => b.unlocked).length)

  return { badges, visibleBadges, unlockedBadges }
}

export { ALL_BADGES, checkStreak, checkSubjectProgress }
