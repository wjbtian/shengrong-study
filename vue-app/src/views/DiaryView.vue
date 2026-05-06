<template>
  <div class="diary-view">
    <!-- 顶部 -->
    <section class="page-header">
      <div class="page-header-content">
        <h1 class="page-title">📔 日记本</h1>
        <p class="page-subtitle">记录每一天的心情和故事</p>
      </div>
      <button class="btn-primary" @click="openWriteModal">
        <span>✏️</span> 写日记
      </button>
    </section>

    <!-- 统计 -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-icon">📖</span>
        <div class="stat-info">
          <span class="stat-value">{{ diary.length }}</span>
          <span class="stat-label">篇日记</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🔥</span>
        <div class="stat-info">
          <span class="stat-value">{{ streak }}</span>
          <span class="stat-label">连续(天)</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">📅</span>
        <div class="stat-info">
          <span class="stat-value">{{ thisMonth }}</span>
          <span class="stat-label">本月</span>
        </div>
      </div>
    </div>

    <!-- 心情分布 -->
    <section class="mood-section" v-if="moodDistribution.length">
      <h3 class="section-title">心情分布</h3>
      <div class="mood-bars">
        <div
          v-for="m in moodDistribution"
          :key="m.mood"
          class="mood-bar-item"
          :title="m.label + ': ' + m.count + '篇'"
        >
          <span class="mood-bar-icon">{{ m.icon }}</span>
          <div class="mood-bar-track">
            <div class="mood-bar-fill" :style="{ width: m.percent + '%', background: m.color }"></div>
          </div>
          <span class="mood-bar-count">{{ m.count }}</span>
        </div>
      </div>
    </section>

    <!-- 心情墙 -->
    <section class="mood-wall-section" v-if="moodWallItems.length">
      <h3 class="section-title">近三月心情</h3>
      <div class="mood-wall-items">
        <div v-for="item in moodWallItems" :key="item.month" class="mood-wall-item">
          <span class="mood-wall-icon">{{ item.icon }}</span>
          <span class="mood-wall-month">{{ item.month }}</span>
          <span class="mood-wall-count">{{ item.count }}篇</span>
        </div>
      </div>
    </section>

    <!-- 筛选 -->
    <MoodFilter :filters="filters" :current="selectedMood" @change="selectMood" />

    <!-- 日记列表 -->
    <div class="diary-list">
      <DiaryCard
        v-for="item in pagedDiary"
        :key="item.id"
        :diary="item"
        @edit="openEditModal(item)"
        @delete="confirmDelete(item)"
      />
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="load-more">
      <button class="btn-load" @click="loadMore">加载更多</button>
    </div>

    <!-- 空状态 -->
    <div v-if="pagedDiary.length === 0 && !loading" class="empty-state">
      <span class="empty-icon">📔</span>
      <p>还没有日记</p>
      <button class="btn-primary" @click="openWriteModal">写下第一篇</button>
    </div>

    <!-- 写日记弹窗 -->
    <DiaryForm :show="showWriteModal" @close="showWriteModal = false" @save="handleSave" />

    <!-- 编辑弹窗 -->
    <DiaryForm :show="showEditModal" :diary="editingDiary" @close="closeEditModal" @save="handleUpdate" />

    <!-- 删除确认 -->
    <ConfirmDialog
      v-if="deleteTarget"
      :show="!!deleteTarget"
      title="删除日记"
      message="确定要删除这篇日记吗？"
      confirm-text="删除"
      @confirm="doDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDiary } from '../composables/useDiary.js'
import DiaryCard from '../components/DiaryCard.vue'
import DiaryForm from '../components/DiaryForm.vue'
import MoodFilter from '../components/MoodFilter.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const {
  diary,
  loading,
  selectedMood,
  moodDistribution,
  pagedDiary,
  hasMore,
  streak,
  thisMonth,
  moodWallItems,
  filters,
  selectMood,
  load,
  save,
  update,
  remove
} = useDiary()

const showWriteModal = ref(false)
const showEditModal = ref(false)
const editingDiary = ref(null)
const deleteTarget = ref(null)

function openWriteModal() { showWriteModal.value = true }
function openEditModal(item) { editingDiary.value = item; showEditModal.value = true }
function closeEditModal() { showEditModal.value = false; editingDiary.value = null }

async function handleSave(data) {
  await save(data)
  showWriteModal.value = false
}

async function handleUpdate(data) {
  await update(data.id, data)
  closeEditModal()
}

function confirmDelete(item) { deleteTarget.value = item }
async function doDelete() {
  if (deleteTarget.value) {
    await remove(deleteTarget.value.id)
    deleteTarget.value = null
  }
}

onMounted(() => load())
</script>

<style scoped>
.diary-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 50px 12px 0;
}

/* 顶部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 900;
  color: var(--text);
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--text3);
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
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
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--text);
}

.stat-label {
  font-size: 12px;
  color: var(--text3);
}

/* 心情分布 */
.mood-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.mood-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mood-bar-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mood-bar-icon {
  font-size: 18px;
  min-width: 24px;
  text-align: center;
}

.mood-bar-track {
  flex: 1;
  height: 10px;
  background: var(--surface2);
  border-radius: 5px;
  overflow: hidden;
}

.mood-bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.5s ease;
}

.mood-bar-count {
  font-size: 13px;
  color: var(--text2);
  min-width: 24px;
  text-align: right;
  font-weight: 600;
}

/* 心情墙 */
.mood-wall-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.mood-wall-items {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.mood-wall-item {
  background: var(--surface2);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mood-wall-icon {
  font-size: 28px;
}

.mood-wall-month {
  font-size: 13px;
  color: var(--text2);
  font-weight: 500;
}

.mood-wall-count {
  font-size: 15px;
  color: var(--text);
  font-weight: 700;
}

/* 日记列表 */
.diary-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

/* 加载更多 */
.load-more {
  text-align: center;
  margin: 24px 0;
}

.btn-load {
  padding: 12px 32px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  color: var(--text2);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-load:hover {
  background: var(--surface2);
  color: var(--text);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 72px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.4;
}

.empty-state p {
  color: var(--text3);
  margin: 0 0 24px;
  font-size: 16px;
}

/* 响应式 */
@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .mood-wall-items {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>
