<template>
  <div class="diary-view">
    <!-- 顶部英雄区 -->
    <section class="diary-hero">
      <div class="diary-hero-content">
        <div class="diary-hero-emoji">📔</div>
        <h1 class="diary-hero-title">成长日记</h1>
        <p class="diary-hero-subtitle">记录每一天的精彩瞬间</p>
        <div class="diary-hero-stats">
          <div class="diary-hero-stat">
            <span class="diary-hero-stat-num">{{ diary.length }}</span>
            <span class="diary-hero-stat-label">篇日记</span>
          </div>
          <div class="diary-hero-stat">
            <span class="diary-hero-stat-num">{{ streak }}</span>
            <span class="diary-hero-stat-label">连续天数</span>
          </div>
          <div class="diary-hero-stat">
            <span class="diary-hero-stat-num">{{ thisMonth }}</span>
            <span class="diary-hero-stat-label">本月</span>
          </div>
        </div>
      </div>
      <button class="btn-write" @click="showWriteModal = true">
        <span>✍️</span> 写日记
      </button>
    </section>

    <!-- 心情分布 -->
    <section class="mood-stats-section">
      <div class="section-header">
        <h3 class="section-title">心情分布</h3>
        <span class="section-subtitle">最近30天</span>
      </div>
      <div class="mood-distribution">
        <div
          v-for="item in moodDistribution"
          :key="item.mood"
          class="mood-dist-item"
        >
          <span class="mood-dist-icon" :style="{ color: item.color }">{{ item.mood }}</span>
          <div class="mood-dist-bar-bg">
            <div
              class="mood-dist-bar-fill"
              :style="{ width: item.percent + '%', background: item.color }"
            ></div>
          </div>
          <span class="mood-dist-count">{{ item.count }}</span>
        </div>
      </div>
    </section>

    <!-- 心情时光轴 -->
    <section class="mood-wall-section">
      <div class="section-header">
        <h3 class="section-title">心情时光轴</h3>
        <span class="section-subtitle">点击表情查看详情</span>
      </div>
      <div class="mood-wall">
        <div class="mood-wall-items">
          <div
            v-for="item in moodWallItems"
            :key="item.id"
            class="mood-wall-item"
            :class="{ active: selectedMood === item.mood }"
            @click="selectMood(item.mood)"
          >
            <span class="mood-wall-icon">{{ item.mood }}</span>
            <span class="mood-wall-date">{{ item.date }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 日记列表 -->
    <section class="diary-list-section">
      <div class="section-header-with-action">
        <div>
          <h3 class="section-title">日记列表</h3>
          <span class="section-subtitle">按时间倒序排列</span>
        </div>
        <div class="diary-filters">
          <button
            v-for="filter in filters"
            :key="filter.value"
            class="diary-filter"
            :class="{ active: currentFilter === filter.value }"
            @click="currentFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>
      <div class="diary-card-list">
        <div
          v-for="item in filteredDiary"
          :key="item.id"
          class="diary-card"
        >
          <div class="diary-card-header">
            <span class="diary-card-mood" :style="getMoodStyle(item.mood)">{{ item.mood }}</span>
            <div class="diary-card-actions">
              <span class="diary-card-date">{{ item.date }}</span>
              <button class="diary-action-btn" @click.stop="openEdit(item)" title="编辑">✏️</button>
              <button class="diary-action-btn delete" @click.stop="removeDiary(item.id)" title="删除">🗑️</button>
            </div>
          </div>
          <h4 class="diary-card-title">{{ item.title || '无标题' }}</h4>
          <p class="diary-card-content">{{ item.content }}</p>
          <div v-if="item.tags?.length" class="diary-card-tags">
            <span v-for="tag in item.tags" :key="tag" class="diary-tag">{{ tag }}</span>
          </div>
        </div>
      </div>
      <div v-if="filteredDiary.length === 0" class="empty-state">
        暂无日记记录
      </div>
      <div v-if="hasMore" class="load-more">
        <button class="btn-load-more" @click="loadMore">
          加载更多 ({{ filteredDiary.length }} / {{ diary.length }})
        </button>
      </div>
    </section>

    <!-- 写日记弹窗 -->
    <div v-if="showWriteModal" class="modal" @click.self="showWriteModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>✍️ 写日记</h3>
          <button class="modal-close" @click="showWriteModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="mood-selector">
            <span
              v-for="m in moods"
              :key="m"
              class="mood-option"
              :class="{ selected: newDiary.mood === m }"
              @click="newDiary.mood = m"
            >{{ m }}</span>
          </div>
          <input v-model="newDiary.title" class="input" placeholder="标题（可选）">
          <textarea v-model="newDiary.content" class="textarea" rows="6" placeholder="今天发生了什么有趣的事？"></textarea>
          <input v-model="newDiary.tags" class="input" placeholder="标签，用空格分隔">
        </div>
        <div class="modal-footer">
          <button class="btn" @click="showWriteModal = false">取消</button>
          <button class="btn btn-primary" @click="saveDiary">保存</button>
        </div>
      </div>
    </div>

    <!-- 编辑日记弹窗 -->
    <div v-if="showEditModal" class="modal" @click.self="showEditModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>✏️ 编辑日记</h3>
          <button class="modal-close" @click="showEditModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="mood-selector">
            <span
              v-for="m in moods"
              :key="m"
              class="mood-option"
              :class="{ selected: editingDiary?.mood === m }"
              @click="editingDiary && (editingDiary.mood = m)"
            >{{ m }}</span>
          </div>
          <input v-model="editingDiary.title" class="input" placeholder="标题（可选）">
          <textarea v-model="editingDiary.content" class="textarea" rows="6" placeholder="今天发生了什么有趣的事？"></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="showEditModal = false">取消</button>
          <button class="btn btn-primary" @click="updateDiary">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDiary, postDiary, putDiary, deleteDiary } from '../utils/api.js'

const diary = ref([])
const showWriteModal = ref(false)
const showEditModal = ref(false)
const editingDiary = ref(null)
const currentFilter = ref('all')
const selectedMood = ref(null)

// 心情配置：图标 + 颜色
const moodConfig = {
  happy:     { icon: '☀️', label: '开心', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  good:      { icon: '🌟', label: '不错', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  awesome:   { icon: '🔥', label: '超棒', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' },
  cool:      { icon: '🚀', label: '酷炫', color: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)' },
  celebrate: { icon: '🎉', label: '庆祝', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
  calm:      { icon: '🍃', label: '平静', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
  sad:       { icon: '🌧️', label: '难过', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' },
  cry:       { icon: '💧', label: '伤心', color: '#475569', bg: 'rgba(71, 85, 105, 0.15)' },
  angry:     { icon: '⚡', label: '生气', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  tired:     { icon: '🌙', label: '疲惫', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)' }
}

const moodKeys = Object.keys(moodConfig)
const moods = moodKeys.map(k => moodConfig[k].icon)

const newDiary = ref({
  mood: moodConfig.good.icon,
  title: '',
  content: '',
  tags: ''
})

// 分页
const pageSize = 10
const currentPage = ref(1)
const hasMore = computed(() => {
  let result = diary.value
  if (currentFilter.value !== 'all') {
    result = result.filter(d => d.mood === currentFilter.value)
  }
  if (selectedMood.value) {
    result = result.filter(d => d.mood === selectedMood.value)
  }
  return result.length > currentPage.value * pageSize
})

const filters = [
  { value: 'all', label: '全部' },
  { value: '☀️', label: '☀️ 开心' },
  { value: '🔥', label: '🔥 超棒' },
  { value: '🌟', label: '🌟 不错' },
  { value: '🌧️', label: '🌧️ 难过' },
]

// 心情分布
const moodDistribution = computed(() => {
  const stats = {}
  diary.value.forEach(d => { if (d.mood) stats[d.mood] = (stats[d.mood] || 0) + 1 })
  const total = Object.values(stats).reduce((a, b) => a + b, 0)
  return Object.entries(stats)
    .map(([mood, count]) => {
      const cfg = Object.values(moodConfig).find(m => m.icon === mood) || { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' }
      return { mood, count, percent: total ? Math.round((count / total) * 100) : 0, color: cfg.color }
    })
    .sort((a, b) => b.count - a.count)
})

// 心情墙
const moodWallItems = computed(() => {
  return diary.value
    .filter(d => d.mood)
    .slice(0, 30)
    .map(d => ({ id: d.id, mood: d.mood, date: d.date.slice(5) }))
})

// 筛选 + 分页
const filteredDiary = computed(() => {
  let result = diary.value
  if (currentFilter.value !== 'all') {
    result = result.filter(d => d.mood === currentFilter.value)
  }
  if (selectedMood.value) {
    result = result.filter(d => d.mood === selectedMood.value)
  }
  return result.slice(0, currentPage.value * pageSize)
})

function loadMore() {
  currentPage.value++
}

// 连续天数
const streak = computed(() => {
  const dates = [...new Set(diary.value.map(d => d.date))].sort().reverse()
  if (!dates.length) return 0
  let count = 1
  const today = new Date().toISOString().split('T')[0]
  if (dates[0] !== today) return 0
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    if ((prev - curr) / 86400000 === 1) count++
    else break
  }
  return count
})

// 本月
const thisMonth = computed(() => {
  const month = new Date().toISOString().slice(0, 7)
  return diary.value.filter(d => d.date?.startsWith(month)).length
})

function selectMood(mood) {
  selectedMood.value = selectedMood.value === mood ? null : mood
}

function getMoodStyle(moodIcon) {
  const cfg = Object.values(moodConfig).find(m => m.icon === moodIcon)
  if (!cfg) return {}
  return {
    color: cfg.color,
    background: cfg.bg,
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '18px'
  }
}

function getMoodLabel(icon) {
  const cfg = Object.values(moodConfig).find(m => m.icon === icon)
  return cfg ? cfg.label : ''
}

async function saveDiary() {
  if (!newDiary.value.content.trim()) return
  const data = {
    ...newDiary.value,
    tags: newDiary.value.tags.split(' ').filter(Boolean),
    date: new Date().toISOString().split('T')[0]
  }
  try {
    await postDiary(data)
    diary.value.unshift(data)
    showWriteModal.value = false
    newDiary.value = { mood: moodConfig.good.icon, title: '', content: '', tags: '' }
    currentPage.value = 1 // 重置到第一页
  } catch (e) {
    console.error('保存日记失败:', e)
  }
}

function openEdit(item) {
  editingDiary.value = { ...item }
  showEditModal.value = true
}

async function updateDiary() {
  if (!editingDiary.value || !editingDiary.value.content.trim()) return
  try {
    await putDiary(editingDiary.value.id, editingDiary.value)
    const idx = diary.value.findIndex(d => d.id === editingDiary.value.id)
    if (idx !== -1) diary.value[idx] = { ...editingDiary.value }
    showEditModal.value = false
    editingDiary.value = null
  } catch (e) {
    console.error('更新日记失败:', e)
  }
}

async function removeDiary(id) {
  if (!confirm('确定要删除这篇日记吗？')) return
  try {
    await deleteDiary(id)
    diary.value = diary.value.filter(d => d.id !== id)
  } catch (e) {
    console.error('删除日记失败:', e)
  }
}

onMounted(async () => {
  try {
    diary.value = await getDiary().catch(() => [])
  } catch (e) {
    console.error('加载日记失败:', e)
  }
})
</script>

<style scoped>
.diary-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 50px 12px 0;
  box-sizing: border-box;
}

/* 英雄区 */
.diary-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px;
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.08) 0%, rgba(129, 140, 248, 0.05) 100%);
  border-radius: 16px;
  border: 1px solid rgba(74, 222, 128, 0.15);
  margin-bottom: 24px;
}

.diary-hero-content {
  flex: 1;
}

.diary-hero-emoji {
  font-size: 48px;
  margin-bottom: 8px;
}

.diary-hero-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 4px;
}

.diary-hero-subtitle {
  font-size: 14px;
  color: var(--text2);
  margin-bottom: 16px;
}

.diary-hero-stats {
  display: flex;
  gap: 24px;
}

.diary-hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.diary-hero-stat-num {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent);
}

.diary-hero-stat-label {
  font-size: 12px;
  color: var(--text2);
}

.btn-write {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--accent);
  color: var(--bg);
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-write:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(74, 222, 128, 0.3);
}

/* 心情分布 */
.mood-stats-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.mood-distribution {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mood-dist-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mood-dist-icon {
  font-size: 20px;
  width: 32px;
  text-align: center;
}

.mood-dist-bar-bg {
  flex: 1;
  height: 8px;
  background: var(--surface3);
  border-radius: 4px;
  overflow: hidden;
}

.mood-dist-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.mood-dist-count {
  font-size: 13px;
  color: var(--text2);
  width: 24px;
  text-align: right;
}

/* 心情墙 */
.mood-wall-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.mood-wall {
  overflow-x: auto;
  padding-bottom: 8px;
}

.mood-wall-items {
  display: flex;
  gap: 12px;
}

.mood-wall-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  background: var(--surface2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
}

.mood-wall-item:hover {
  background: var(--surface3);
}

.mood-wall-item.active {
  background: var(--accent-dim);
  border: 1px solid var(--accent);
}

.mood-wall-icon {
  font-size: 28px;
}

.mood-wall-date {
  font-size: 11px;
  color: var(--text3);
}

/* 日记列表 */
.diary-list-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}

.section-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.diary-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.diary-filter {
  padding: 6px 14px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.diary-filter:hover {
  background: var(--surface3);
}

.diary-filter.active {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--accent);
}

.diary-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.diary-card {
  padding: 16px;
  background: var(--surface2);
  border-radius: 10px;
  transition: all 0.2s;
}

.diary-card:hover {
  background: var(--surface3);
}

.diary-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.diary-card-mood {
  font-size: 20px;
}

.diary-card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.diary-card-date {
  font-size: 12px;
  color: var(--text2);
}

.diary-action-btn {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.6;
  transition: all 0.2s;
}

.diary-action-btn:hover {
  opacity: 1;
  background: var(--surface3);
}

.diary-action-btn.delete:hover {
  background: rgba(248, 113, 113, 0.2);
}

.diary-card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 6px;
}

.diary-card-content {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.diary-card-tags {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.diary-tag {
  font-size: 11px;
  padding: 2px 8px;
  background: var(--surface3);
  border-radius: 4px;
  color: var(--text2);
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 20px 0 10px;
}

.btn-load-more {
  padding: 10px 24px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text2);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-load-more:hover {
  background: var(--surface3);
  border-color: var(--accent);
  color: var(--accent);
}

/* 弹窗 */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.modal-content {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text2);
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

.mood-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.mood-option {
  font-size: 28px;
  padding: 8px;
  background: var(--surface2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.mood-option:hover {
  background: var(--surface3);
}

.mood-option.selected {
  background: var(--accent-dim);
  border: 2px solid var(--accent);
}

.input, .textarea {
  padding: 10px 14px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.input:focus, .textarea:focus {
  border-color: var(--accent);
}

.textarea {
  resize: vertical;
  min-height: 120px;
}

.btn {
  padding: 8px 16px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: var(--surface3);
}

.btn-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
  font-weight: 600;
}

.btn-primary:hover {
  background: var(--accent-light);
}

/* 通用 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.section-subtitle {
  font-size: 12px;
  color: var(--text2);
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text3);
  font-size: 14px;
}

@media (max-width: 768px) {
  .diary-hero {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  .diary-hero-stats {
    justify-content: center;
  }
  .section-header-with-action {
    flex-direction: column;
  }
}
</style>
