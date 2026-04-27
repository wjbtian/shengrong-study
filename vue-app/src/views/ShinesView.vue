<template>
  <div class="shines-view">
    <!-- 顶部 -->
    <section class="page-header">
      <div class="page-header-content">
        <h1 class="page-title">✨ 闪光时刻</h1>
        <p class="page-subtitle">记录成长中的每一个精彩瞬间</p>
      </div>
      <button class="btn-primary" @click="showAddModal = true">
        <span>📸</span> 记录闪光
      </button>
    </section>

    <!-- 统计 -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-icon">🏆</span>
        <span class="stat-value">{{ shines.length }}</span>
        <span class="stat-label">闪光时刻</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🔥</span>
        <span class="stat-value">{{ streak }}</span>
        <span class="stat-label">连续记录(天)</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">⭐</span>
        <span class="stat-value">{{ favCount }}</span>
        <span class="stat-label">精选时刻</span>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div class="filter-bar">
      <button
        v-for="filter in filters"
        :key="filter.value"
        class="filter-btn"
        :class="{ active: currentFilter === filter.value }"
        @click="currentFilter = filter.value"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- 照片墙 -->
    <div class="photo-wall">
      <div
        v-for="item in filteredShines"
        :key="item.id"
        class="photo-card"
        @click="openLightbox(item)"
      >
        <div class="photo-placeholder">
          <img v-if="item.photoUrl" :src="item.photoUrl" class="photo-img" alt="">
          <span v-else class="photo-icon">{{ categoryIcon(item.category) }}</span>
        </div>
        <div class="photo-info">
          <h4 class="photo-title">{{ item.title }}</h4>
          <p class="photo-date">{{ item.date }}</p>
          <p v-if="item.desc" class="photo-desc">{{ item.desc }}</p>
        </div>
        <div class="photo-actions">
          <button
            class="photo-fav"
            :class="{ active: item.fav }"
            @click.stop="toggleFav(item)"
          >
            {{ item.fav ? '⭐' : '☆' }}
          </button>
          <button
            class="photo-delete"
            @click.stop="confirmDelete(item)"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <div v-if="filteredShines.length === 0" class="empty-state">
      还没有闪光时刻
    </div>

    <!-- 添加弹窗 -->
    <div v-if="showAddModal" class="modal" @click.self="showAddModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>📸 记录闪光时刻</h3>
          <button class="modal-close" @click="showAddModal = false">✕</button>
        </div>
        <div class="modal-body">
          <input v-model="newShine.title" class="input" placeholder="标题">
          <select v-model="newShine.category" class="input">
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
          </select>
          <textarea v-model="newShine.desc" class="textarea" rows="3" placeholder="描述（可选）"></textarea>
          <input type="file" class="input" accept="image/*" @change="onPhotoChange">
        </div>
        <div class="modal-footer">
          <button class="btn" @click="showAddModal = false">取消</button>
          <button class="btn btn-primary" @click="saveShine">保存</button>
        </div>
      </div>
    </div>

    <!-- 灯箱 -->
    <div v-if="lightboxItem" class="lightbox" @click.self="lightboxItem = null">
      <div class="lightbox-content">
        <button class="lightbox-close" @click="lightboxItem = null">✕</button>
        <div class="lightbox-photo">
          <img v-if="lightboxItem.photoUrl" :src="lightboxItem.photoUrl" class="lightbox-img" alt="">
          <span v-else class="lightbox-icon">{{ categoryIcon(lightboxItem.category) }}</span>
        </div>
        <h3>{{ lightboxItem.title }}</h3>
        <p>{{ lightboxItem.date }}</p>
        <p v-if="lightboxItem.desc">{{ lightboxItem.desc }}</p>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteModal" class="modal" @click.self="showDeleteModal = false">
      <div class="modal-content modal-sm">
        <div class="modal-header">
          <h3>🗑️ 确认删除</h3>
          <button class="modal-close" @click="showDeleteModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p>确定要删除「{{ deleteTarget?.title }}」吗？此操作不可恢复。</p>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="showDeleteModal = false">取消</button>
          <button class="btn btn-danger" @click="doDelete">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getShines, postShine, deleteShine } from '../utils/api.js'

const shines = ref([])
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const currentFilter = ref('all')
const lightboxItem = ref(null)
const deleteTarget = ref(null)

const categories = [
  { value: 'award', label: '🏆 获奖' },
  { value: 'sport', label: '⚽ 运动' },
  { value: 'art', label: '🎨 创意' },
  { value: 'talent', label: '🎸 才艺' },
  { value: 'progress', label: '📈 进步' },
  { value: 'other', label: '💫 其他' },
]

const filters = [
  { value: 'all', label: '全部' },
  { value: 'award', label: '🏆 获奖' },
  { value: 'sport', label: '⚽ 运动' },
  { value: 'art', label: '🎨 创意' },
  { value: 'talent', label: '🎸 才艺' },
  { value: 'progress', label: '📈 进步' },
  { value: 'other', label: '💫 其他' },
]

const newShine = ref({
  title: '',
  category: 'other',
  desc: '',
  photo: null
})

const filteredShines = computed(() => {
  if (currentFilter.value === 'all') return shines.value
  return shines.value.filter(s => s.category === currentFilter.value)
})

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

function categoryIcon(category) {
  const map = { award: '🏆', sport: '⚽', art: '🎨', talent: '🎸', progress: '📈', other: '💫' }
  return map[category] || '✨'
}

function onPhotoChange(e) {
  newShine.value.photo = e.target.files[0]
}

async function saveShine() {
  if (!newShine.value.title.trim()) return
  const data = {
    ...newShine.value,
    date: new Date().toISOString().split('T')[0],
    fav: false
  }
  try {
    await postShine(data)
    shines.value.unshift(data)
    showAddModal.value = false
    newShine.value = { title: '', category: 'other', desc: '', photo: null }
  } catch (e) {
    console.error('保存失败:', e)
  }
}

function toggleFav(item) {
  item.fav = !item.fav
}

function openLightbox(item) {
  lightboxItem.value = item
}

function confirmDelete(item) {
  deleteTarget.value = item
  showDeleteModal.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  try {
    await deleteShine(deleteTarget.value.id)
    shines.value = shines.value.filter(s => s.id !== deleteTarget.value.id)
    showDeleteModal.value = false
    deleteTarget.value = null
  } catch (e) {
    console.error('删除失败:', e)
    alert('删除失败，请重试')
  }
}

onMounted(async () => {
  try {
    shines.value = await getShines().catch(() => [])
  } catch (e) {
    console.error('加载闪光时刻失败:', e)
  }
})
</script>

<style scoped>
.shines-view {
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
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(244, 114, 182, 0.05) 100%);
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
  grid-template-columns: repeat(3, 1fr);
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

/* 筛选 */
.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: var(--surface2);
}

.filter-btn.active {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--accent);
}

/* 照片墙 */
.photo-wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.photo-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.photo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.photo-placeholder {
  aspect-ratio: 4/3;
  background: linear-gradient(135deg, var(--surface2), var(--surface3));
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.photo-card:hover .photo-img {
  transform: scale(1.05);
}

.photo-icon {
  font-size: 48px;
}

.photo-info {
  padding: 14px;
}

.photo-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.photo-date {
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 6px;
}

.photo-desc {
  font-size: 13px;
  color: var(--text2);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.photo-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 6px;
}

.photo-fav,
.photo-delete {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.photo-fav:hover,
.photo-delete:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.photo-fav.active {
  color: #fbbf24;
}

.photo-delete:hover {
  background: rgba(239, 68, 68, 0.8);
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

.input, .textarea, select.input {
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

.btn-danger {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
  font-weight: 600;
}

.btn-danger:hover {
  background: #dc2626;
}

.modal-sm {
  max-width: 400px;
}

/* 灯箱 */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 40px;
}

.lightbox-content {
  text-align: center;
  color: var(--text);
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: var(--text);
  font-size: 24px;
  cursor: pointer;
}

.lightbox-photo {
  max-width: 80vw;
  max-height: 60vh;
  margin: 0 auto 20px;
  background: var(--surface);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.lightbox-img {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 16px;
}

.lightbox-icon {
  font-size: 80px;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text3);
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .photo-wall {
    grid-template-columns: 1fr;
  }
  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>
