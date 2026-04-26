<template>
  <div class="home-view">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <h1 class="greeting">{{ greeting }}，永远的神！</h1>
      <p class="today-date">{{ todayDate }}</p>
      <p class="daily-quote" v-if="dailyQuote">
        <span class="quote-text">"{{ dailyQuote.text }}"</span>
        <span class="quote-author">—— {{ dailyQuote.author }}</span>
      </p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon">📔</div>
          <div class="stat-value">{{ stats.diary }}</div>
          <div class="stat-label">日记篇数</div>
          <div class="stat-trend">+{{ stats.diaryWeek }} 本周</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon">✨</div>
          <div class="stat-value">{{ stats.shines }}</div>
          <div class="stat-label">闪光时刻</div>
          <div class="stat-trend">+{{ stats.shinesWeek }} 本周</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon">🎸</div>
          <div class="stat-value">{{ stats.guitar }}</div>
          <div class="stat-label">吉他练习</div>
          <div class="stat-trend">+{{ stats.guitarWeek }} 本周</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon">🔬</div>
          <div class="stat-value">{{ stats.tech }}</div>
          <div class="stat-label">科技探索</div>
          <div class="stat-trend">+{{ stats.techWeek }} 本周</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 今日任务 -->
    <el-card class="tasks-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>📋 今日任务</span>
          <el-tag :type="allTasksDone ? 'success' : 'warning'" effect="dark">
            {{ completedTasks }}/{{ tasks.length }}
          </el-tag>
        </div>
      </template>
      <div class="task-list">
        <div
          v-for="task in tasks"
          :key="task.id"
          class="task-item"
          :class="{ completed: task.completed }"
          @click="toggleTask(task.id)"
        >
          <div class="task-checkbox" :class="{ checked: task.completed }">
            <el-icon v-if="task.completed"><Check /></el-icon>
          </div>
          <span class="task-text">{{ task.text }}</span>
          <el-tag v-if="task.category" size="small" :type="taskType(task.category)">
            {{ task.category }}
          </el-tag>
        </div>
      </div>
      <div v-if="allTasksDone" class="tasks-celebrate">
        🎉 太棒了！今日任务全部完成！
      </div>
    </el-card>

    <!-- 学习进度 -->
    <el-row :gutter="16" class="progress-row">
      <el-col :xs="24" :sm="12" :md="8" v-for="subject in subjects" :key="subject.key">
        <el-card class="progress-card" shadow="hover">
          <div class="progress-header">
            <span class="progress-icon">{{ subject.icon }}</span>
            <span class="progress-name">{{ subject.name }}</span>
            <span class="progress-percent">{{ subject.percent }}%</span>
          </div>
          <el-progress
            :percentage="subject.percent"
            :color="subject.color"
            :stroke-width="10"
            :show-text="false"
          />
          <div class="progress-detail">{{ subject.completed }}/{{ subject.total }} {{ subject.unit }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 活跃度图表 + 心情趋势 -->
    <el-row :gutter="16" class="charts-row">
      <el-col :xs="24" :lg="14">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>📊 7天活跃度</span>
            </div>
          </template>
          <div class="activity-chart">
            <div
              v-for="(day, idx) in activityData"
              :key="idx"
              class="activity-day"
            >
              <div class="activity-bars">
                <div
                  class="activity-bar diary"
                  :style="{ height: day.diaryHeight + 'px' }"
                  :title="'日记 ' + day.diary"
                ></div>
                <div
                  class="activity-bar shine"
                  :style="{ height: day.shineHeight + 'px' }"
                  :title="'闪光 ' + day.shine"
                ></div>
                <div
                  class="activity-bar guitar"
                  :style="{ height: day.guitarHeight + 'px' }"
                  :title="'吉他 ' + day.guitar"
                ></div>
              </div>
              <span class="day-label" :class="{ today: day.isToday }">{{ day.label }}</span>
            </div>
          </div>
          <div class="chart-legend">
            <span><span class="legend-dot diary"></span>日记</span>
            <span><span class="legend-dot shine"></span>闪光</span>
            <span><span class="legend-dot guitar"></span>吉他</span>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>😊 心情趋势</span>
            </div>
          </template>
          <div v-if="moodData.length" class="mood-content">
            <div class="mood-timeline">
              <div
                v-for="(mood, idx) in recentMoods"
                :key="idx"
                class="mood-item"
              >
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
                  <div
                    class="mood-bar-fill"
                    :style="{ width: item.percent + '%', background: item.color }"
                  ></div>
                </div>
                <span class="mood-count">{{ item.count }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">暂无心情数据</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 成就徽章 -->
    <el-card class="badges-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>🏅 成就徽章</span>
          <span class="badge-progress">{{ unlockedBadges }}/{{ badges.length }}</span>
        </div>
      </template>
      <div class="badges-grid">
        <div
          v-for="badge in visibleBadges"
          :key="badge.id"
          class="badge-item"
          :class="{ unlocked: badge.unlocked, locked: !badge.unlocked, mystery: badge.isMystery }"
          :title="badge.desc"
        >
          <div class="badge-glow" v-if="badge.unlocked"></div>
          <div class="badge-icon">{{ badge.icon }}</div>
          <div class="badge-name">{{ badge.name }}</div>
        </div>
      </div>
    </el-card>

    <!-- 艾宾浩斯复习提醒 -->
    <el-card v-if="reviews.length" class="reviews-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>🧠 今日复习</span>
          <el-tag type="info" effect="dark">{{ reviews.length }} 项</el-tag>
        </div>
      </template>
      <div class="review-list">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="review-item"
        >
          <span class="review-subject">{{ review.subject }}</span>
          <span class="review-title">{{ review.title }}</span>
          <el-tag size="small" :type="review.stageType">{{ review.stage }}</el-tag>
        </div>
      </div>
    </el-card>

    <!-- 最近记录 -->
    <el-row :gutter="16" class="recent-row">
      <el-col :xs="24" :md="12">
        <el-card class="recent-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>📝 最近日记</span>
              <el-button text type="primary" size="small" @click="$router.push('/diary')">查看全部</el-button>
            </div>
          </template>
          <div v-if="recentDiary.length" class="recent-list">
            <div
              v-for="d in recentDiary"
              :key="d.id"
              class="recent-item"
            >
              <span class="recent-mood">{{ d.mood }}</span>
              <div class="recent-content">
                <div class="recent-title">{{ d.title || '无标题' }}</div>
                <div class="recent-date">{{ d.date }}</div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">还没有日记</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="recent-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>✨ 最近闪光</span>
              <el-button text type="primary" size="small" @click="$router.push('/shines')">查看全部</el-button>
            </div>
          </template>
          <div v-if="recentShines.length" class="recent-list">
            <div
              v-for="s in recentShines"
              :key="s.id"
              class="recent-item"
            >
              <span class="recent-icon">{{ s.icon || '✨' }}</span>
              <div class="recent-content">
                <div class="recent-title">{{ s.title }}</div>
                <div class="recent-date">{{ s.date }}</div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">还没有闪光时刻</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Check } from '@element-plus/icons-vue'
import { getDiary, getShines, getGuitar, getTech, getProgress } from '../utils/api.js'

const router = useRouter()

// 数据
const diary = ref([])
const shines = ref([])
const guitar = ref([])
const tech = ref([])
const progress = ref({})
const loading = ref(true)

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

function taskType(category) {
  const map = { '日记': 'success', '吉他': 'warning', '学习': 'primary', '科技': 'info' }
  return map[category] || 'info'
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
  diaryWeek: countThisWeek(diary.value),
  shinesWeek: countThisWeek(shines.value),
  guitarWeek: countThisWeek(guitar.value),
  techWeek: countThisWeek(tech.value),
}))

// 学习进度
const subjects = computed(() => {
  const doneUnits = progress.value?.doneUnits || []
  const doneOM = progress.value?.doneOM || []

  const getDone = (prefix, total) => doneUnits.filter(u => u.startsWith(prefix)).length

  return [
    { key: 'chinese', name: '语文', icon: '📖', color: '#4ade80', unit: '单元', completed: getDone('chinese_', 8), total: 8 },
    { key: 'math', name: '数学', icon: '🔢', color: '#60a5fa', unit: '知识点', completed: getDone('math_', 6), total: 6 },
    { key: 'english', name: '英语', icon: '🔤', color: '#f472b6', unit: '主题', completed: getDone('english_', 6), total: 6 },
    { key: 'olympiad', name: '奥数', icon: '🧩', color: '#fbbf24', unit: '专题', completed: doneOM.length, total: 20 },
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
      diary: dCount,
      shine: sCount,
      guitar: gCount,
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
  moodData.value.forEach(d => {
    stats[d.mood] = (stats[d.mood] || 0) + 1
  })
  const total = moodData.value.length
  const colors = {
    '😊': '#4ade80', '😄': '#22c55e', '🤩': '#16a34a', '😎': '#15803d',
    '🥳': '#86efac', '😐': '#94a3b8', '😔': '#64748b', '😢': '#475569',
    '😭': '#334155', '😤': '#f87171', '😴': '#cbd5e1'
  }
  return Object.entries(stats)
    .map(([mood, count]) => ({
      mood,
      count,
      percent: Math.round((count / total) * 100),
      color: colors[mood] || '#94a3b8'
    }))
    .sort((a, b) => b.count - a.count)
})

// 成就徽章（35个）
const ALL_BADGES = [
  // === 日记系列 ===
  { id: 'first_diary', icon: '📝', name: '初识笔墨', desc: '写下第一篇日记', check: (d) => d?.length >= 1 },
  { id: 'diary_10', icon: '📄', name: '日积月累', desc: '累计10篇日记', check: (d) => d?.length >= 10 },
  { id: 'diary_30', icon: '📚', name: '笔耕不辍', desc: '累计30篇日记', check: (d) => d?.length >= 30 },
  { id: 'diary_60', icon: '📖', name: '日记达人', desc: '累计60篇日记', check: (d) => d?.length >= 60 },
  { id: 'diary_100', icon: '🏆', name: '文思泉涌', desc: '累计100篇日记', check: (d) => d?.length >= 100 },
  { id: 'diary_365', icon: '👑', name: '年度记录者', desc: '累计365篇日记', check: (d) => d?.length >= 365 },

  // === 闪光时刻系列 ===
  { id: 'first_shine', icon: '✨', name: '闪光初现', desc: '记录第一个闪光时刻', check: (s) => s?.length >= 1 },
  { id: 'shine_10', icon: '🌟', name: '星光点点', desc: '累计10个闪光时刻', check: (s) => s?.length >= 10 },
  { id: 'shine_30', icon: '🌠', name: '星光璀璨', desc: '累计30个闪光时刻', check: (s) => s?.length >= 30 },
  { id: 'shine_50', icon: '🎆', name: '闪耀全场', desc: '累计50个闪光时刻', check: (s) => s?.length >= 50 },
  { id: 'shine_100', icon: '💫', name: '传奇时刻', desc: '累计100个闪光时刻', check: (s) => s?.length >= 100 },

  // === 吉他练习系列 ===
  { id: 'first_guitar', icon: '🎸', name: '弦音初鸣', desc: '完成第一次吉他练习', check: (g) => g?.length >= 1 },
  { id: 'guitar_10', icon: '🎵', name: '渐入佳境', desc: '累计10次吉他练习', check: (g) => g?.length >= 10 },
  { id: 'guitar_30', icon: '🎶', name: '音乐之路', desc: '累计30次吉他练习', check: (g) => g?.length >= 30 },
  { id: 'guitar_50', icon: '🎤', name: '吉他高手', desc: '累计50次吉他练习', check: (g) => g?.length >= 50 },
  { id: 'guitar_100', icon: '🎼', name: '音乐大师', desc: '累计100次吉他练习', check: (g) => g?.length >= 100 },

  // === 科技探索系列 ===
  { id: 'first_tech', icon: '🔬', name: '科技先锋', desc: '收藏第一条科技新闻', check: (t) => t?.length >= 1 },
  { id: 'tech_10', icon: '🔭', name: '探索者', desc: '累计10条科技新闻', check: (t) => t?.length >= 10 },
  { id: 'tech_30', icon: '🚀', name: '未来探索者', desc: '累计30条科技新闻', check: (t) => t?.length >= 30 },
  { id: 'tech_50', icon: '🛸', name: '星际旅行者', desc: '累计50条科技新闻', check: (t) => t?.length >= 50 },
  { id: 'tech_100', icon: '🌌', name: '宇宙智者', desc: '累计100条科技新闻', check: (t) => t?.length >= 100 },

  // === 连续打卡系列 ===
  { id: 'week_streak', icon: '🔥', name: '持之以恒', desc: '连续7天有记录', check: (d, s, g) => checkStreak(d, s, g, 7) },
  { id: 'month_streak', icon: '⚡', name: '坚持不懈', desc: '连续30天有记录', check: (d, s, g) => checkStreak(d, s, g, 30) },
  { id: 'quarter_streak', icon: '🌞', name: '日出而作', desc: '连续90天有记录', check: (d, s, g) => checkStreak(d, s, g, 90) },
  { id: 'year_streak', icon: '🌅', name: '全年无休', desc: '连续365天有记录', check: (d, s, g) => checkStreak(d, s, g, 365) },

  // === 学习进度系列 ===
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

  // === 特殊成就 ===
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

  // === 依赖型徽章（最后计算）===
  { id: 'collector', icon: '🏆', name: '收藏家', desc: '解锁10个成就徽章', check: (d, s, g, t, p, unlocked) => unlocked >= 10 },
  { id: 'master', icon: '💎', name: '成就大师', desc: '解锁25个成就徽章', check: (d, s, g, t, p, unlocked) => unlocked >= 25 },
  { id: 'legend', icon: '👑', name: '传奇人物', desc: '解锁全部成就徽章', check: (d, s, g, t, p, unlocked, total) => unlocked >= total },
]

// 计算徽章状态
const badges = computed(() => {
  const d = diary.value, s = shines.value, g = guitar.value, t = tech.value, p = progress.value

  // 第一轮：计算基础徽章
  let unlocked = 0
  const result = ALL_BADGES.map(badge => {
    const isUnlocked = badge.check(d, s, g, t, p, 0, ALL_BADGES.length)
    if (isUnlocked) unlocked++
    return { ...badge, unlocked: isUnlocked }
  })

  // 第二轮：重新计算依赖型徽章
  result.forEach(badge => {
    if (['collector', 'master', 'legend'].includes(badge.id)) {
      badge.unlocked = badge.check(d, s, g, t, p, unlocked, ALL_BADGES.length)
    }
  })

  return result
})

// 只显示已解锁的徽章 + 3个问号占位
const visibleBadges = computed(() => {
  const unlocked = badges.value.filter(b => b.unlocked)
  const locked = badges.value.filter(b => !b.unlocked)

  // 已解锁的显示在前面
  const visible = [...unlocked]

  // 添加3个神秘徽章占位（如果还有未解锁的）
  if (locked.length > 0) {
    const mysteryCount = Math.min(3, locked.length)
    for (let i = 0; i < mysteryCount; i++) {
      visible.push({
        id: `mystery_${i}`,
        icon: '❓',
        name: '???',
        desc: '达成特定条件后解锁',
        unlocked: false,
        isMystery: true
      })
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
  const done = (progress?.doneUnits || []).filter(u => u.startsWith(prefix)).length
  return done >= target
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
        const subject = unitId.startsWith('chinese_') ? '语文' :
                       unitId.startsWith('math_') ? '数学' :
                       unitId.startsWith('english_') ? '英语' : '其他'
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

// 最近记录
const recentDiary = computed(() => diary.value.slice(0, 3))
const recentShines = computed(() => shines.value.slice(0, 3))

// 加载数据
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
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home-view {
  max-width: 1200px;
}

/* 欢迎区域 */
.welcome-section {
  margin-bottom: 24px;
}

.greeting {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 4px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.today-date {
  font-size: 14px;
  color: var(--text2);
  margin-bottom: 12px;
}

.daily-quote {
  padding: 16px 20px;
  background: var(--surface);
  border-left: 4px solid var(--accent);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  font-style: italic;
}

.quote-text {
  color: var(--text);
  font-size: 15px;
}

.quote-author {
  color: var(--text2);
  font-size: 13px;
  margin-left: 8px;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  background: var(--surface);
  border: 1px solid var(--border);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: var(--border2);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--accent);
}

.stat-label {
  font-size: 13px;
  color: var(--text2);
  margin-top: 4px;
}

.stat-trend {
  font-size: 12px;
  color: var(--accent);
  margin-top: 4px;
}

/* 任务卡片 */
.tasks-card {
  background: var(--surface);
  border: 1px solid var(--border);
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--surface2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.task-item:hover {
  background: var(--surface3);
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.completed .task-text {
  text-decoration: line-through;
  color: var(--text3);
}

.task-checkbox {
  width: 22px;
  height: 22px;
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

.task-text {
  flex: 1;
  color: var(--text);
  font-size: 14px;
}

.tasks-celebrate {
  text-align: center;
  padding: 16px;
  color: var(--accent);
  font-size: 16px;
  font-weight: 600;
  animation: celebrate 0.5s ease;
}

@keyframes celebrate {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

/* 进度卡片 */
.progress-row {
  margin-bottom: 24px;
}

.progress-card {
  background: var(--surface);
  border: 1px solid var(--border);
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.progress-icon {
  font-size: 20px;
}

.progress-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.progress-percent {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent);
}

.progress-detail {
  font-size: 12px;
  color: var(--text2);
  margin-top: 8px;
}

/* 图表区域 */
.charts-row {
  margin-bottom: 24px;
}

.chart-card {
  background: var(--surface);
  border: 1px solid var(--border);
  height: 100%;
}

.activity-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 140px;
  padding: 16px 8px 0;
}

.activity-day {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.activity-bars {
  display: flex;
  gap: 2px;
  align-items: flex-end;
  height: 100px;
}

.activity-bar {
  width: 8px;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  min-height: 2px;
}

.activity-bar.diary {
  background: var(--accent);
}

.activity-bar.shine {
  background: var(--accent2);
}

.activity-bar.guitar {
  background: var(--yellow);
}

.day-label {
  font-size: 12px;
  color: var(--text3);
}

.day-label.today {
  color: var(--accent);
  font-weight: 700;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 12px;
  font-size: 12px;
  color: var(--text2);
}

.legend-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}

.legend-dot.diary {
  background: var(--accent);
}

.legend-dot.shine {
  background: var(--accent2);
}

.legend-dot.guitar {
  background: var(--yellow);
}

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
  font-size: 18px;
  min-width: 30px;
  text-align: center;
}

.mood-bar-bg {
  flex: 1;
  height: 8px;
  background: var(--surface2);
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
  min-width: 24px;
  text-align: right;
}

/* 徽章 */
.badges-card {
  background: var(--surface);
  border: 1px solid var(--border);
  margin-bottom: 24px;
}

.badge-progress {
  font-size: 14px;
  color: var(--accent);
  font-weight: 600;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: var(--radius-sm);
  transition: all 0.3s;
  position: relative;
}

.badge-item.unlocked {
  background: var(--surface2);
}

.badge-item.locked {
  opacity: 0.4;
  filter: grayscale(1);
}

.badge-item.mystery {
  opacity: 0.6;
  background: var(--surface2);
  border: 1px dashed var(--border2);
}

.badge-item.mystery .badge-icon {
  filter: blur(0px);
  animation: mystery-pulse 2s ease-in-out infinite;
}

@keyframes mystery-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.badge-item:hover {
  transform: translateY(-2px);
}

.badge-glow {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-sm);
  background: radial-gradient(circle at center, rgba(74, 222, 128, 0.15), transparent 70%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.badge-icon {
  font-size: 28px;
  z-index: 1;
}

.badge-name {
  font-size: 11px;
  color: var(--text2);
  text-align: center;
  z-index: 1;
}

/* 复习 */
.reviews-card {
  background: var(--surface);
  border: 1px solid var(--border);
  margin-bottom: 24px;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--surface2);
  border-radius: var(--radius-xs);
}

.review-subject {
  font-size: 12px;
  color: var(--accent);
  font-weight: 600;
  min-width: 40px;
}

.review-title {
  flex: 1;
  font-size: 14px;
  color: var(--text);
}

/* 最近记录 */
.recent-row {
  margin-bottom: 24px;
}

.recent-card {
  background: var(--surface);
  border: 1px solid var(--border);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--surface2);
  border-radius: var(--radius-xs);
}

.recent-mood,
.recent-icon {
  font-size: 20px;
  min-width: 30px;
  text-align: center;
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
  color: var(--text3);
  margin-top: 2px;
}

.empty-state {
  text-align: center;
  padding: 24px;
  color: var(--text3);
  font-size: 14px;
}
</style>
