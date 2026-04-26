<template>
  <div class="guitar-view">
    <!-- 顶部 -->
    <section class="page-header">
      <div class="page-header-content">
        <h1 class="page-title">🎸 吉他练习</h1>
        <p class="page-subtitle">记录每一次练习，见证音乐成长</p>
      </div>
      <button class="btn-primary" @click="showUploadModal = true">
        <span>📹</span> 上传视频
      </button>
    </section>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-icon">🎵</span>
        <span class="stat-value">{{ stats.total }}</span>
        <span class="stat-label">练习次数</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">⏱️</span>
        <span class="stat-value">{{ stats.duration }}</span>
        <span class="stat-label">总时长(分钟)</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🎼</span>
        <span class="stat-value">{{ stats.songs }}</span>
        <span class="stat-label">学会曲目</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">📅</span>
        <span class="stat-value">{{ stats.streak }}</span>
        <span class="stat-label">连续练习(天)</span>
      </div>
    </div>

    <!-- 本周目标 -->
    <section class="goal-section">
      <div class="section-header">
        <h2 class="section-title">🎯 本周目标</h2>
        <button class="btn-text" @click="showGoalModal = true">修改目标</button>
      </div>
      <div class="goal-card">
        <div class="goal-info">
          <div class="goal-title">每周练习目标</div>
          <div class="goal-progress">
            <div class="goal-bar">
              <div class="goal-fill" :style="{ width: goalPercent + '%' }"></div>
            </div>
            <div class="goal-text">{{ goalCurrent }} / {{ goalTarget }} 次</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 最新练习 -->
    <section v-if="latestVideo" class="latest-section">
      <div class="section-header">
        <h2 class="section-title">🎬 最新练习</h2>
      </div>
      <div class="video-card">
        <video v-if="latestVideo.url" :src="latestVideo.url" controls class="video-player"></video>
        <div class="video-info">
          <h4>{{ latestVideo.title }}</h4>
          <p>{{ latestVideo.date }}</p>
          <p v-if="latestVideo.notes">{{ latestVideo.notes }}</p>
        </div>
      </div>
    </section>

    <!-- 练习历史 -->
    <section class="history-section">
      <div class="section-header">
        <h2 class="section-title">📚 练习历史</h2>
      </div>
      <div class="history-list">
        <div v-for="item in guitarList" :key="item.id" class="history-item">
          <span class="history-icon">🎸</span>
          <div class="history-info">
            <div class="history-title">{{ item.title }}</div>
            <div class="history-date">{{ item.date }}</div>
          </div>
        </div>
      </div>
      <div v-if="guitarList.length === 0" class="empty-state">
        还没有练习记录
      </div>
    </section>

    <!-- 上传弹窗 -->
    <div v-if="showUploadModal" class="modal" @click.self="showUploadModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>📹 上传练习视频</h3>
          <button class="modal-close" @click="showUploadModal = false">✕</button>
        </div>
        <div class="modal-body">
          <input v-model="newVideo.title" class="input" placeholder="曲目名称">
          <input type="file" class="input" accept="video/*" @change="onFileChange">
          <textarea v-model="newVideo.notes" class="textarea" rows="3" placeholder="练习笔记（可选）"></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="showUploadModal = false">取消</button>
          <button class="btn btn-primary" @click="uploadVideo">上传</button>
        </div>
      </div>
    </div>

    <!-- 目标设置弹窗 -->
    <div v-if="showGoalModal" class="modal" @click.self="showGoalModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>🎯 设置练习目标</h3>
          <button class="modal-close" @click="showGoalModal = false">✕</button>
        </div>
        <div class="modal-body">
          <label class="input-label">每周练习次数</label>
          <input v-model.number="goalTarget" type="number" class="input" min="1" max="7">
          <label class="input-label">每次练习时长（分钟）</label>
          <input v-model.number="goalDuration" type="number" class="input" min="10" max="120">
        </div>
        <div class="modal-footer">
          <button class="btn" @click="showGoalModal = false">取消</button>
          <button class="btn btn-primary" @click="saveGoal">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getGuitar, postGuitar } from '../utils/api.js'

const guitar = ref([])
const showUploadModal = ref(false)
const showGoalModal = ref(false)

const goalTarget = ref(3)
const goalDuration = ref(30)

const newVideo = ref({
  title: '',
  file: null,
  notes: ''
})

const stats = computed(() => ({
  total: guitar.value.length,
  duration: guitar.value.reduce((sum, g) => sum + (g.duration || 0), 0),
  songs: new Set(guitar.value.map(g => g.title)).size,
  streak: calcStreak()
}))

const goalCurrent = computed(() => {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  return guitar.value.filter(g => g.date >= weekAgo).length
})

const goalPercent = computed(() => {
  return Math.min(100, Math.round((goalCurrent.value / goalTarget.value) * 100))
})

const latestVideo = computed(() => guitar.value[0] || null)

const guitarList = computed(() => guitar.value.slice(1))

function calcStreak() {
  const dates = [...new Set(guitar.value.map(g => g.date))].sort().reverse()
  if (!dates.length) return 0
  let count = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    if ((prev - curr) / 86400000 === 1) count++
    else break
  }
  return count
}

function onFileChange(e) {
  newVideo.value.file = e.target.files[0]
}

async function uploadVideo() {
  if (!newVideo.value.title.trim()) return
  const data = {
    title: newVideo.value.title,
    notes: newVideo.value.notes,
    date: new Date().toISOString().split('T')[0]
  }
  try {
    await postGuitar(data)
    guitar.value.unshift(data)
    showUploadModal.value = false
    newVideo.value = { title: '', file: null, notes: '' }
  } catch (e) {
    console.error('上传失败:', e)
  }
}

function saveGoal() {
  localStorage.setItem('guitar-goal-target', goalTarget.value)
  localStorage.setItem('guitar-goal-duration', goalDuration.value)
  showGoalModal.value = false
}

onMounted(async () => {
  try {
    guitar.value = await getGuitar().catch(() => [])
    const savedTarget = localStorage.getItem('guitar-goal-target')
    const savedDuration = localStorage.getItem('guitar-goal-duration')
    if (savedTarget) goalTarget.value = parseInt(savedTarget)
    if (savedDuration) goalDuration.value = parseInt(savedDuration)
  } catch (e) {
    console.error('加载吉他数据失败:', e)
  }
})
</script>

<style scoped>
.guitar-view {
  max-width: 1200px;
  margin: 0 auto;
}

/* 顶部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(129, 140, 248, 0.05) 100%);
  border-radius: 16px;
  border: 1px solid rgba(251, 191, 36, 0.15);
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text2);
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--accent);
  color: var(--bg);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(74, 222, 128, 0.3);
}

/* 统计 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.stat-icon {
  font-size: 28px;
  margin-bottom: 8px;
  display: block;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #fbbf24;
}

.stat-label {
  font-size: 12px;
  color: var(--text2);
  margin-top: 4px;
}

/* 目标 */
.goal-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.goal-card {
  padding: 16px;
  background: var(--surface2);
  border-radius: 10px;
}

.goal-title {
  font-size: 14px;
  color: var(--text);
  margin-bottom: 10px;
}

.goal-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.goal-bar {
  height: 10px;
  background: var(--surface3);
  border-radius: 5px;
  overflow: hidden;
}

.goal-fill {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.goal-text {
  font-size: 13px;
  color: var(--text2);
}

/* 视频 */
.latest-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.video-card {
  border-radius: 10px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  max-height: 400px;
  border-radius: 10px;
}

.video-info {
  padding: 12px 0;
}

.video-info h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.video-info p {
  font-size: 13px;
  color: var(--text2);
}

/* 历史 */
.history-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--surface2);
  border-radius: 10px;
}

.history-icon {
  font-size: 20px;
}

.history-info {
  flex: 1;
}

.history-title {
  font-size: 14px;
  color: var(--text);
}

.history-date {
  font-size: 12px;
  color: var(--text2);
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

.input, .textarea {
  padding: 10px 14px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 14px;
  outline: none;
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.input-label {
  font-size: 13px;
  color: var(--text2);
  margin-bottom: -8px;
}

.btn {
  padding: 8px 16px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
}

.btn-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
  font-weight: 600;
}

.btn-text {
  background: none;
  border: none;
  color: var(--accent);
  font-size: 13px;
  cursor: pointer;
}

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

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text3);
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>
