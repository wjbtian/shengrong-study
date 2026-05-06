<template>
  <div class="diary-view">
    <!-- 顶部 -->
    <section class="page-header">
      <div>
        <h1>📔 日记本</h1>
        <p class="subtitle">记录每一天的心情和故事</p>
      </div>
      <button class="btn-primary" @click="openWriteModal">
        <span>✏️</span> 写日记
      </button>
    </section>

    <!-- 统计 -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-icon">📖</span>
        <div>
          <span class="stat-value">{{ diary.length }}</span>
          <span class="stat-label">篇日记</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🔥</span>
        <div>
          <span class="stat-value">{{ streak }}</span>
          <span class="stat-label">连续(天)</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">📅</span>
        <div>
          <span class="stat-value">{{ thisMonth }}</span>
          <span class="stat-label">本月</span>
        </div>
      </div>
    </div>

    <!-- 心情分布 -->
    <div class="mood-distribution" v-if="moodDistribution.length">
      <p class="section-title">心情分布</p>
      <div class="mood-bars">
        <div
          v-for="m in moodDistribution"
          :key="m.mood"
          class="mood-bar-item"
          :title="`${m.label}: ${m.count}篇`"
        >
          <span class="mood-bar-icon">{{ m.icon }}</span>
          <div class="mood-bar-track">
            <div class="mood-bar-fill" :style="{ width: m.percent + '%', background: m.color }"></div>
          </div>
          <span class="mood-bar-count">{{ m.count }}</span>
        </div>
      </div>
    </div>

    <!-- 心情墙 -->
    <div class="mood-wall" v-if="moodWallItems.length">
      <p class="section-title">近三月心情</p>
      <div class="mood-wall-items">
        <div v-for="item in moodWallItems" :key="item.month" class="mood-wall-item">
          <span class="mood-wall-icon">{{ item.icon }}</span>
          <span class="mood-wall-month">{{ item.month }}</span>
          <span class="mood-wall-count">{{ item.count }}篇</span>
        </div>
      </div>
    </div>

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
      :message="`确定要删除这篇日记吗？`"
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
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 20px 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 900;
  color: var(--text);
}

.subtitle {
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
}

.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon { font-size: 24px; }

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--text);
  display: block;
}

.stat-label {
  font-size: 12px;
  color: var(--text3);
}

.section-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text2);
}

.mood-distribution, .mood-wall {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
}

.mood-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mood-bar-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mood-bar-icon { font-size: 16px; }

.mood-bar-track {
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

.mood-bar-count {
  font-size: 12px;
  color: var(--text3);
  min-width: 20px;
  text-align: right;
}

.mood-wall-items {
  display: flex;
  gap: 12px;
}

.mood-wall-item {
  flex: 1;
  background: var(--surface2);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}

.mood-wall-icon { font-size: 24px; display: block; }
.mood-wall-month { font-size: 12px; color: var(--text2); display: block; }
.mood-wall-count { font-size: 14px; color: var(--text); font-weight: 600; }

.diary-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.load-more {
  text-align: center;
  margin-top: 24px;
}

.btn-load {
  padding: 12px 32px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  color: var(--text2);
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-state p {
  color: var(--text3);
  margin: 0 0 24px;
}

@media (max-width: 768px) {
  .stats-row { flex-direction: column; }
  .mood-wall-items { flex-direction: column; }
}
</style>
