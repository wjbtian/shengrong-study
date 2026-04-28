<template>
  <div class="home-view">
    <!-- 3D欢迎动画 -->
    <Welcome3D :showWelcome="showWelcome" @skip="skipWelcome" />

    <!-- 顶部欢迎区 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="greeting">{{ greeting }}，永远的神！</h1>
        <p class="today-date">{{ todayDate }}</p>
        <div class="daily-quote" v-if="dailyQuote">
          <span class="quote-mark">"</span>
          <span class="quote-text">{{ dailyQuote.text }}</span>
          <span class="quote-author">—— {{ dailyQuote.author }}</span>
        </div>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <span class="hero-stat-value">{{ stats.diary }}</span>
          <span class="hero-stat-label">日记</span>
        </div>
        <div class="hero-stat">
          <span class="hero-stat-value">{{ stats.shines }}</span>
          <span class="hero-stat-label">闪光</span>
        </div>
        <div class="hero-stat">
          <span class="hero-stat-value">{{ stats.guitar }}</span>
          <span class="hero-stat-label">吉他</span>
        </div>
        <div class="hero-stat">
          <span class="hero-stat-value">{{ unlockedBadges }}</span>
          <span class="hero-stat-label">徽章</span>
        </div>
      </div>
    </section>

    <!-- 今日任务 + 学习进度 -->
    <div class="two-column">
      <!-- 左：今日任务 -->
      <section class="tasks-section">
        <div class="section-header">
          <h2>📋 今日任务</h2>
          <span class="task-progress">{{ completedTasks }}/{{ tasks.length }}</span>
        </div>
        <div class="task-list">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="task-item"
            :class="{ completed: task.completed }"
            @click="toggleTask(task.id)"
          >
            <div class="task-checkbox" :class="{ checked: task.completed }">
              <svg v-if="task.completed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span class="task-text">{{ task.text }}</span>
            <span class="task-tag" :class="task.category">{{ task.category }}</span>
          </div>
        </div>
        <div v-if="allTasksDone" class="tasks-celebrate">
          🎉 太棒了！今日任务全部完成！
        </div>
      </section>

      <!-- 右：学习进度 -->
      <section class="progress-section">
        <div class="section-header">
          <h2>📚 学习进度</h2>
        </div>
        <div class="progress-list">
          <div v-for="subject in subjects" :key="subject.key" class="progress-item">
            <div class="progress-info">
              <span class="progress-icon">{{ subject.icon }}</span>
              <span class="progress-name">{{ subject.name }}</span>
              <span class="progress-fraction">{{ subject.completed }}/{{ subject.total }}</span>
            </div>
            <div class="progress-bar-bg">
              <div
                class="progress-bar-fill"
                :style="{ width: subject.percent + '%', background: subject.color }"
              ></div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 7天活跃度 + 最近日记 -->
    <div class="two-column">
      <!-- 左：7天活跃度 -->
      <section class="activity-section">
        <div class="section-header">
          <h2>📊 7天活跃度</h2>
        </div>
        <div class="activity-chart">
          <div
            v-for="(day, idx) in activityData"
            :key="idx"
            class="activity-day"
          >
            <div class="activity-bars">
              <div class="activity-bar diary" :style="{ height: day.diaryHeight + 'px' }"></div>
              <div class="activity-bar shine" :style="{ height: day.shineHeight + 'px' }"></div>
              <div class="activity-bar guitar" :style="{ height: day.guitarHeight + 'px' }"></div>
            </div>
            <span class="day-label" :class="{ today: day.isToday }">{{ day.label }}</span>
          </div>
        </div>
        <div class="chart-legend">
          <span><span class="legend-dot diary"></span>日记</span>
          <span><span class="legend-dot shine"></span>闪光</span>
          <span><span class="legend-dot guitar"></span>吉他</span>
        </div>
      </section>

      <!-- 右：最近日记 -->
      <section class="recent-section">
        <div class="section-header">
          <h2>📝 最近日记</h2>
          <button class="btn-text" @click="$router.push('/diary')">查看全部 →</button>
        </div>
        <div v-if="recentDiary.length" class="recent-list">
          <div v-for="d in recentDiary" :key="d.id" class="recent-item">
            <span class="recent-mood">{{ d.mood }}</span>
            <div class="recent-content">
              <div class="recent-title">{{ d.title || '无标题' }}</div>
              <div class="recent-date">{{ d.date }}</div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">还没有日记</div>
      </section>
    </div>

    <!-- 心情趋势 + 成就徽章 -->
    <div class="two-column">
      <!-- 左：心情 -->
      <section class="mood-section">
        <div class="section-header">
          <h2>😊 心情趋势</h2>
        </div>
        <div v-if="moodData.length" class="mood-content">
          <div class="mood-timeline">
            <div v-for="(mood, idx) in recentMoods" :key="idx" class="mood-item">
              <span class="mood-emoji">{{ mood.mood }}</span>
              <span class="mood-date">{{ mood.date }}</span>
            </div>
          </div>
          <div class="mood-distribution">
            <div
              v-for="(item, idx) in moodDistribution"
              :key="idx"
              class="mood-bar-item"
            >
              <span class="mood-label">{{ item.mood }}</span>
              <div class="mood-bar-bg">
                <div class="mood-bar-fill" :style="{ width: item.percent + '%', background: item.color }"></div>
              </div>
              <span class="mood-count">{{ item.count }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">暂无心情数据</div>
      </section>

      <!-- 右：徽章 -->
      <section class="badges-section">
        <div class="section-header">
          <h2>🏅 成就徽章</h2>
          <span class="badge-count">{{ unlockedBadges }}/{{ badges.length }}</span>
        </div>
        <div class="badges-grid">
          <div
            v-for="badge in visibleBadges"
            :key="badge.id"
            class="badge-item"
            :class="{ unlocked: badge.unlocked, mystery: badge.isMystery }"
            :title="badge.desc"
          >
            <div class="badge-glow" v-if="badge.unlocked"></div>
            <div class="badge-icon">{{ badge.icon }}</div>
            <div class="badge-name">{{ badge.name }}</div>
          </div>
        </div>
      </section>
    </div>

    <!-- 艾宾浩斯复习 -->
    <section v-if="reviews.length" class="reviews-section">
      <div class="section-header">
        <h2>🧠 今日复习</h2>
        <span class="review-count">{{ reviews.length }} 项</span>
      </div>
      <div class="review-list">
        <div v-for="review in reviews" :key="review.id" class="review-item">
          <span class="review-subject">{{ review.subject }}</span>
          <span class="review-title">{{ review.title }}</span>
          <span class="review-stage" :class="review.stageType">{{ review.stage }}</span>
        </div>
      </div>
    </section>

    <!-- 闪光时刻照片墙 + 吉他视频 -->
    <div class="two-column">
      <!-- 左：照片墙 -->
      <section class="photo-wall-section">
        <div class="section-header">
          <h2>✨ 闪光时刻</h2>
          <button class="btn-text" @click="$router.push('/shines')">查看全部 →</button>
        </div>
        <div class="photo-wall">
          <div
            v-for="(photo, idx) in showcasePhotos.slice(0, 6)"
            :key="idx"
            class="wall-photo"
            @click="openPhotoModal(photo)"
          >
            <img v-if="photo.url" :src="photo.url" :alt="photo.title" />
            <div v-else class="photo-placeholder">
              <span class="photo-emoji">{{ photo.icon || '✨' }}</span>
            </div>
            <div class="photo-overlay">
              <span class="photo-title">{{ photo.title }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 右：吉他视频 -->
      <section class="guitar-video-section">
        <div class="section-header">
          <h2>🎸 吉他演奏</h2>
          <button class="btn-text" @click="$router.push('/guitar')">查看全部 →</button>
        </div>
        <div class="video-container">
          <video
            v-if="latestGuitarVideo"
            ref="guitarVideo"
            :src="latestGuitarVideo.url"
            controls
            autoplay
            muted
            loop
            class="guitar-video"
            poster=""
          ></video>
          <div v-else class="video-placeholder">
            <span class="video-icon">🎸</span>
            <p>还没有吉他视频</p>
            <button class="btn-text" @click="$router.push('/guitar')">去录制 →</button>
          </div>
        </div>
        <div v-if="latestGuitarVideo" class="video-info">
          <span class="video-title">{{ latestGuitarVideo.title }}</span>
          <span class="video-date">{{ latestGuitarVideo.date }}</span>
        </div>
      </section>
    </div>

    <!-- 照片查看弹窗 -->
    <div v-if="selectedPhoto" class="photo-modal" @click.self="selectedPhoto = null">
      <div class="photo-modal-content">
        <button class="photo-modal-close" @click="selectedPhoto = null">✕</button>
        <div class="photo-modal-image">
          <img v-if="selectedPhoto.url" :src="selectedPhoto.url" :alt="selectedPhoto.title" />
          <span v-else class="photo-modal-emoji">{{ selectedPhoto.icon || '✨' }}</span>
        </div>
        <h3>{{ selectedPhoto.title }}</h3>
        <p>{{ selectedPhoto.date }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDiary, getShines, getGuitar, getTech, getProgress } from '../utils/api.js'
import Welcome3D from '../components/Welcome3D.vue'

const router = useRouter()

const diary = ref([])
const shines = ref([])
const guitar = ref([])
const tech = ref([])
const progress = ref({})
const guitarVideo = ref(null)

// 照片墙展示数据（可替换的照片）
const showcasePhotos = ref([
  { url: '', title: '春游时光', icon: '🌸', date: '2026-04-20' },
  { url: '', title: '数学竞赛', icon: '🏆', date: '2026-04-15' },
  { url: '', title: '吉他练习', icon: '🎸', date: '2026-04-12' },
  { url: '', title: '科技制作', icon: '🔬', date: '2026-04-10' },
  { url: '', title: '英语演讲', icon: '🎤', date: '2026-04-08' },
  { url: '', title: '运动时刻', icon: '⚽', date: '2026-04-05' },
  { url: '', title: '阅读时光', icon: '📚', date: '2026-04-01' },
])

// 最新吉他视频
const latestGuitarVideo = computed(() => {
  if (guitar.value?.videos?.length) {
    return guitar.value.videos[guitar.value.videos.length - 1]
  }
  if (guitar.value?.length) {
    const v = guitar.value[guitar.value.length - 1]
    return { title: v.title || '吉他练习', date: v.date, url: v.videoUrl || v.url }
  }
  return null
})

const selectedPhoto = ref(null)

function openPhotoModal(photo) {
  selectedPhoto.value = photo
}

// 今日任务
const tasks = ref([
  { id: 1, text: '写一篇日记', completed: false, category: '日记' },
  { id: 2, text: '练习吉他30分钟', completed: false, category: '吉他' },
  { id: 3, text: '完成今日学习任务', completed: false, category: '学习' },
  { id: 4, text: '阅读一篇科技新闻', completed: false, category: '科技' },
])

const completedTasks = computed(() => tasks.value.filter(t => t.completed).length)
const allTasksDone = computed(() => completedTasks.value === tasks.value.length)

function toggleTask(id) {
  const task = tasks.value.find(t => t.id === id)
  if (task) task.completed = !task.completed
}

// 问候语
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

// 统计
function countThisWeek(items) {
  if (!items?.length) return 0
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  return items.filter(i => i.date >= weekAgo).length
}

const stats = computed(() => ({
  diary: diary.value.length,
  shines: shines.value.length,
  guitar: guitar.value.length,
  tech: tech.value.length,
}))

// 学习进度
const subjects = computed(() => {
  const doneUnits = progress.value?.doneUnits || []
  const doneOM = progress.value?.doneOM || []
  const getDone = (prefix, total) => doneUnits.filter(u => u.startsWith(prefix)).length

  return [
    { key: 'chinese', name: '语文', icon: '📖', color: '#4ade80', completed: getDone('chinese_', 8), total: 8 },
    { key: 'math', name: '数学', icon: '🔢', color: '#60a5fa', completed: getDone('math_', 6), total: 6 },
    { key: 'english', name: '英语', icon: '🔤', color: '#f472b6', completed: getDone('english_', 6), total: 6 },
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

// 成就徽章
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

const recentDiary = computed(() => diary.value.slice(0, 3))
const recentShines = computed(() => shines.value.slice(0, 3))

// 欢迎动画
const showWelcome = ref(true)

function skipWelcome() {
  showWelcome.value = false
}

// 自动关闭欢迎动画（6秒后）
setTimeout(() => {
  showWelcome.value = false
}, 6000)

onMounted(async () => {
  try {
    const [d, s, g, t, p] = await Promise.all([
      getDiary().catch(() => []),
      getShines().catch(() => []),
      getGuitar().catch(() => []),
      getTech().catch(() => []),
      getProgress().catch(() => ({}))
    ])
    diary.value = d
    shines.value = s
    guitar.value = g
    tech.value = t
    progress.value = p
  } catch (e) {
    console.error('加载首页数据失败:', e)
  }
})
</script>

<style scoped>
.home-view {
  width: 100%;
  max-width: 100%;
  padding: 0 12px;
  box-sizing: border-box;
}

/* 顶部欢迎区 */
.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  padding: 28px 32px;
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(129, 140, 248, 0.06) 100%);
  border-radius: 20px;
  border: 1px solid rgba(74, 222, 128, 0.2);
}

.hero-content {
  flex: 1;
}

.greeting {
  font-size: 36px;
  font-weight: 900;
  margin-bottom: 6px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(74, 222, 128, 0.3);
  letter-spacing: -0.5px;
}

.today-date {
  font-size: 15px;
  color: var(--text2);
  margin-bottom: 14px;
  font-weight: 500;
}

.daily-quote {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.quote-mark {
  font-size: 28px;
  color: var(--accent);
  opacity: 0.6;
  line-height: 1;
  font-weight: 700;
}

.quote-text {
  color: var(--text);
  font-size: 16px;
  font-style: italic;
  line-height: 1.6;
}

.quote-author {
  color: var(--text2);
  font-size: 13px;
  font-weight: 500;
}

.hero-stats {
  display: flex;
  gap: 32px;
  padding-left: 32px;
  border-left: 1px solid rgba(255,255,255,0.1);
}

.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.hero-stat-value {
  font-size: 42px;
  font-weight: 900;
  color: var(--accent);
  text-shadow: 0 0 20px rgba(74, 222, 128, 0.4);
  line-height: 1;
}

.hero-stat-label {
  font-size: 13px;
  color: var(--text2);
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* 通用 section */
section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

section:hover {
  border-color: rgba(74, 222, 128, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 800;
  color: var(--text);
  margin: 0;
  letter-spacing: -0.3px;
}

/* 两列布局 */
.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.two-column section {
  margin-bottom: 0;
}

/* 任务 */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--surface2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.task-item:hover {
  background: var(--surface3);
}

.task-item.completed {
  opacity: 0.5;
}

.task-item.completed .task-text {
  text-decoration: line-through;
  color: var(--text3);
}

.task-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.task-checkbox.checked {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
}

.task-checkbox svg {
  width: 12px;
  height: 12px;
}

.task-text {
  flex: 1;
  color: var(--text);
  font-size: 14px;
}

.task-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.task-tag.日记 { background: rgba(74, 222, 128, 0.15); color: #4ade80; }
.task-tag.吉他 { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
.task-tag.学习 { background: rgba(96, 165, 250, 0.15); color: #60a5fa; }
.task-tag.科技 { background: rgba(244, 114, 182, 0.15); color: #f472b6; }

.tasks-celebrate {
  text-align: center;
  padding: 16px;
  color: var(--accent);
  font-size: 15px;
  font-weight: 600;
  animation: celebrate 0.5s ease;
}

@keyframes celebrate {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

/* 学习进度 */
.progress-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-icon {
  font-size: 20px;
}

.progress-name {
  flex: 1;
  font-size: 15px;
  color: var(--text);
  font-weight: 600;
}

.progress-fraction {
  font-size: 14px;
  color: var(--text2);
  font-weight: 700;
}

.progress-bar-bg {
  height: 10px;
  background: var(--surface3);
  border-radius: 5px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.5s ease;
  background: linear-gradient(90deg, var(--accent), #22c55e) !important;
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.3);
}

/* 活跃度图表 */
.activity-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 160px;
  padding: 20px 16px 0;
  gap: 8px;
}

.activity-day {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: 80px;
}

.activity-bars {
  display: flex;
  gap: 3px;
  align-items: flex-end;
  height: 120px;
  width: 100%;
  justify-content: center;
}

.activity-bar {
  width: 10px;
  border-radius: 5px 5px 0 0;
  transition: height 0.3s ease;
  min-height: 4px;
  position: relative;
}

.activity-bar.diary { 
  background: linear-gradient(180deg, #4ade80, #22c55e);
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.3);
}
.activity-bar.shine { 
  background: linear-gradient(180deg, #818cf8, #6366f1);
  box-shadow: 0 0 8px rgba(129, 140, 248, 0.3);
}
.activity-bar.guitar { 
  background: linear-gradient(180deg, #fbbf24, #f59e0b);
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.3);
}

.day-label {
  font-size: 13px;
  color: var(--text3);
  font-weight: 500;
}

.day-label.today {
  color: var(--accent);
  font-weight: 800;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
  font-size: 13px;
  color: var(--text2);
  font-weight: 500;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}

.legend-dot.diary { background: var(--accent); }
.legend-dot.shine { background: var(--accent2); }
.legend-dot.guitar { background: var(--yellow); }

/* 心情 */
.mood-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mood-timeline {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.mood-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 40px;
}

.mood-emoji {
  font-size: 24px;
}

.mood-date {
  font-size: 11px;
  color: var(--text3);
}

.mood-distribution {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mood-bar-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mood-label {
  font-size: 16px;
  width: 24px;
  text-align: center;
}

.mood-bar-bg {
  flex: 1;
  height: 8px;
  background: var(--surface3);
  border-radius: 4px;
  overflow: hidden;
}

.mood-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.mood-count {
  font-size: 12px;
  color: var(--text2);
  width: 20px;
  text-align: right;
}

/* 徽章 */
.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 14px;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 10px;
  border-radius: 14px;
  background: var(--surface2);
  transition: all 0.3s;
  position: relative;
  cursor: pointer;
}

.badge-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.badge-item.unlocked {
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(129, 140, 248, 0.1));
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.badge-item.mystery {
  opacity: 0.4;
}

.badge-glow {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  background: radial-gradient(circle at center, rgba(74, 222, 128, 0.2), transparent 70%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.badge-icon {
  font-size: 32px;
  position: relative;
  z-index: 1;
}

.badge-name {
  font-size: 12px;
  color: var(--text2);
  text-align: center;
  position: relative;
  z-index: 1;
  font-weight: 500;
}

/* 复习 */
.review-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.review-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--surface2);
  border-radius: 10px;
}

.review-subject {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--accent-dim);
  color: var(--accent);
  font-weight: 600;
}

.review-title {
  flex: 1;
  font-size: 14px;
  color: var(--text);
}

.review-stage {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.review-stage.success { background: rgba(74, 222, 128, 0.15); color: #4ade80; }
.review-stage.warning { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
.review-stage.danger { background: rgba(248, 113, 113, 0.15); color: #f87171; }

/* 最近记录 */
.recent-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--surface2);
  border-radius: 10px;
  transition: all 0.2s;
}

.recent-item:hover {
  background: var(--surface3);
}

.recent-mood, .recent-icon {
  font-size: 20px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface3);
  border-radius: 10px;
}

.recent-content {
  flex: 1;
  min-width: 0;
}

.recent-title {
  font-size: 14px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-date {
  font-size: 12px;
  color: var(--text2);
  margin-top: 2px;
}

/* 照片墙 - 统一正方形，不裁剪变形 */
.photo-wall {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.photo-wall .wall-photo {
  aspect-ratio: 1;
  border-radius: 12px;
}

.wall-photo {
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  background: var(--surface2);
  transition: all 0.3s ease;
}

.wall-photo:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  z-index: 10;
}

.wall-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.wall-photo:hover img {
  transform: scale(1.1);
}

/* 照片统一正方形，图片自适应填充 */
.wall-photo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: var(--surface2);
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--surface2), var(--surface3));
}

.photo-emoji {
  font-size: 40px;
}

.wall-photo.photo-size-0 .photo-emoji,
.wall-photo.photo-size-2 .photo-emoji {
  font-size: 64px;
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 10px 10px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  opacity: 0;
  transition: opacity 0.3s;
}

.wall-photo:hover .photo-overlay {
  opacity: 1;
}

.photo-title {
  color: white;
  font-size: 13px;
  font-weight: 600;
}

/* 照片弹窗 */
.photo-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 40px;
}

.photo-modal-content {
  text-align: center;
  color: var(--text);
  max-width: 80vw;
  max-height: 80vh;
}

.photo-modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: var(--text);
  font-size: 24px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.1);
}

.photo-modal-image {
  max-width: 600px;
  max-height: 60vh;
  margin: 0 auto 20px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--surface);
}

.photo-modal-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.photo-modal-emoji {
  font-size: 120px;
  display: block;
  padding: 40px;
}

/* 吉他视频 - 适配手机竖屏 9:16 */
.video-container {
  width: 100%;
  max-width: 280px;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
  background: var(--surface2);
  aspect-ratio: 9 / 16;
  max-height: 360px;
}

.guitar-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.video-icon {
  font-size: 64px;
}

.video-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding: 0 4px;
}

.video-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.video-date {
  font-size: 13px;
  color: var(--text2);
}

/* 通用 */
.empty-state {
  text-align: center;
  padding: 32px;
  color: var(--text3);
  font-size: 14px;
}

.btn-text {
  background: none;
  border: none;
  color: var(--accent);
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-text:hover {
  background: var(--accent-dim);
}

/* 响应式 */
@media (max-width: 1024px) {
  .photo-wall {
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 120px;
  }
  .photo-size-0 {
    grid-column: span 2;
    grid-row: span 2;
  }
  .photo-size-2 {
    grid-row: span 1;
  }
}

@media (max-width: 768px) {
  .two-column {
    grid-template-columns: 1fr;
  }
  .photo-wall {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .hero-section {
    flex-direction: column;
    gap: 20px;
  }
  .hero-stats {
    padding-left: 0;
    border-left: none;
    border-top: 1px solid var(--border);
    padding-top: 20px;
    width: 100%;
    justify-content: space-around;
  }
  .greeting {
    font-size: 22px;
  }
  .photo-wall {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 100px;
    gap: 8px;
  }
  .photo-size-0 {
    grid-column: span 2;
    grid-row: span 2;
  }
  .photo-size-2 {
    grid-row: span 1;
  }
  .wall-photo {
    border-radius: 12px;
  }
  .wall-photo .photo-emoji {
    font-size: 32px !important;
  }
}

@media (max-width: 480px) {
  .photo-wall {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
}

/* 欢迎动画 */
.welcome-overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a1a 100%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  animation: welcomeFadeOut 0.8s ease 4.5s forwards;
  cursor: pointer;
}

.welcome-text {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0 20px;
}

.welcome-char {
  font-size: 52px;
  font-weight: 900;
  color: var(--accent);
  text-shadow: 0 0 30px rgba(74, 222, 128, 0.5), 0 0 60px rgba(74, 222, 128, 0.2);
  opacity: 0;
  transform: translateY(-100px);
  animation: charDrop 0.6s ease forwards;
}

@keyframes charDrop {
  0% {
    opacity: 0;
    transform: translateY(-100px) rotate(-10deg);
  }
  60% {
    opacity: 1;
    transform: translateY(10px) rotate(3deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(0);
  }
}

.welcome-subtitle {
  font-size: 18px;
  color: var(--text2);
  opacity: 0;
  animation: subtitleIn 0.8s ease forwards;
}

@keyframes subtitleIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-photos {
  display: flex;
  gap: 16px;
  margin-top: 20px;
}

.welcome-photo {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  object-fit: cover;
  opacity: 0;
  transform: scale(0) rotate(-20deg);
  animation: photoPop 0.6s ease forwards;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

@keyframes photoPop {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-20deg);
  }
  70% {
    opacity: 1;
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

.welcome-skip {
  position: absolute;
  bottom: 40px;
  font-size: 13px;
  color: var(--text3);
  opacity: 0.6;
  animation: skipPulse 2s ease infinite;
}

@keyframes skipPulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes welcomeFadeOut {
  0% {
    opacity: 1;
    visibility: visible;
  }
  100% {
    opacity: 0;
    visibility: hidden;
  }
}

@media (max-width: 768px) {
  .welcome-char {
    font-size: 36px;
  }
  .welcome-subtitle {
    font-size: 15px;
  }
  .welcome-photo {
    width: 60px;
    height: 60px;
    border-radius: 12px;
  }
}
</style>
