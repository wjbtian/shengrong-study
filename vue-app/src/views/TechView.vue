<template>
  <div class="tech-view">
    <!-- 顶部 -->
    <section class="page-header">
      <div class="page-header-content">
        <h1 class="page-title">🚀 科技探索</h1>
        <p class="page-subtitle">发现科技的奥秘，记录每一个精彩瞬间</p>
      </div>
      <button class="btn-primary" @click="showAddModal = true">
        <span>🔬</span> 添加新闻
      </button>
    </section>

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

    <!-- 新闻列表 -->
    <div class="tech-list">
      <div
        v-for="item in filteredTech"
        :key="item.id"
        class="tech-card"
      >
        <div class="tech-card-header">
          <span class="tech-category">{{ item.category }}</span>
          <span class="tech-date">{{ item.date }}</span>
        </div>
        <h3 class="tech-title">{{ item.title }}</h3>
        <p class="tech-summary">{{ item.summary }}</p>
        <div v-if="item.source" class="tech-source">
          <span class="source-icon">📰</span>
          <span>{{ item.source }}</span>
        </div>
      </div>
    </div>

    <div v-if="filteredTech.length === 0" class="empty-state">
      暂无科技新闻
    </div>

    <!-- 添加弹窗 -->
    <div v-if="showAddModal" class="modal" @click.self="showAddModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>🔬 添加科技新闻</h3>
          <button class="modal-close" @click="showAddModal = false">✕</button>
        </div>
        <div class="modal-body">
          <input v-model="newTech.title" class="input" placeholder="新闻标题">
          <select v-model="newTech.category" class="input">
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <textarea v-model="newTech.summary" class="textarea" rows="4" placeholder="新闻摘要"></textarea>
          <input v-model="newTech.source" class="input" placeholder="来源（可选）">
        </div>
        <div class="modal-footer">
          <button class="btn" @click="showAddModal = false">取消</button>
          <button class="btn btn-primary" @click="saveTech">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getTech, postTech } from '../utils/api.js'

const tech = ref([])
const showAddModal = ref(false)
const currentFilter = ref('all')

const categories = ['🔬 科学', '🤖 AI', '🚀 航天', '💻 编程', '🔋 能源']

const filters = [
  { value: 'all', label: '全部' },
  { value: '🔬 科学', label: '🔬 科学' },
  { value: '🤖 AI', label: '🤖 AI' },
  { value: '🚀 航天', label: '🚀 航天' },
  { value: '💻 编程', label: '💻 编程' },
  { value: '🔋 能源', label: '🔋 能源' },
]

const newTech = ref({
  title: '',
  category: '🔬 科学',
  summary: '',
  source: ''
})

const filteredTech = computed(() => {
  if (currentFilter.value === 'all') return tech.value
  return tech.value.filter(t => t.category === currentFilter.value)
})

async function saveTech() {
  if (!newTech.value.title.trim() || !newTech.value.summary.trim()) return
  const data = {
    ...newTech.value,
    date: new Date().toISOString().split('T')[0]
  }
  try {
    await postTech(data)
    tech.value.unshift(data)
    showAddModal.value = false
    newTech.value = { title: '', category: '🔬 科学', summary: '', source: '' }
  } catch (e) {
    console.error('保存失败:', e)
  }
}

onMounted(async () => {
  try {
    tech.value = await getTech().catch(() => [])
  } catch (e) {
    console.error('加载科技新闻失败:', e)
  }
})
</script>

<style scoped>
.tech-view {
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
  background: linear-gradient(135deg, rgba(244, 114, 182, 0.08) 0%, rgba(129, 140, 248, 0.05) 100%);
  border-radius: 16px;
  border: 1px solid rgba(244, 114, 182, 0.15);
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

/* 新闻列表 */
.tech-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tech-card {
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: all 0.2s;
}

.tech-card:hover {
  background: var(--surface2);
  transform: translateY(-2px);
}

.tech-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.tech-category {
  font-size: 12px;
  padding: 4px 10px;
  background: var(--accent-dim);
  color: var(--accent);
  border-radius: 6px;
  font-weight: 600;
}

.tech-date {
  font-size: 12px;
  color: var(--text2);
}

.tech-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.tech-summary {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.6;
}

.tech-source {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--text3);
}

.source-icon {
  font-size: 14px;
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
  transition: all 0.2s;
}

.input:focus, .textarea:focus, select.input:focus {
  border-color: var(--accent);
}

.textarea {
  resize: vertical;
  min-height: 100px;
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

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text3);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>
