<template>
  <div class="shines-view">
    <!-- 顶部 -->
    <section class="page-header">
      <div class="page-header-content">
        <h1 class="page-title">✨ 闪光时刻</h1>
        <p class="page-subtitle">记录成长中的每一个精彩瞬间</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <span>📸</span> 记录闪光
      </button>
    </section>

    <!-- 统计 -->
    <ShineStats :total="shines.length" :streak="streak" :favCount="favCount" />

    <!-- 分类筛选 -->
    <div class="filter-bar">
      <button
        v-for="f in filters"
        :key="f.value"
        class="filter-btn"
        :class="{ active: currentFilter === f.value }"
        @click="currentFilter = f.value"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- 照片墙 -->
    <div class="photo-wall">
      <ShineCard
        v-for="item in filteredShines"
        :key="item.id"
        :shine="item"
        :icon="categoryIcon(item.category)"
        @open="openLightbox"
        @fav="toggleFav(item)"
        @edit="openEditModal(item)"
        @delete="confirmDelete(item)"
      />
    </div>

    <!-- 空状态 -->
    <div v-if="filteredShines.length === 0 && !loading" class="empty-state">
      <span class="empty-icon">✨</span>
      <p>还没有闪光时刻</p>
      <button class="btn-primary" @click="openAddModal">记录第一个闪光</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 添加/编辑弹窗 -->
    <ShineModal
      :show="showModal"
      :edit="editingShine"
      @close="closeModal"
      @save="handleSave"
    />

    <!-- 灯箱 -->
    <PhotoLightbox
      :item="lightboxItem"
      @close="lightboxItem = null"
    />

    <!-- 删除确认 -->
    <ConfirmDialog
      v-if="deleteTarget"
      :show="!!deleteTarget"
      title="删除确认"
      :message="`确定要删除「${deleteTarget.title}」吗？`"
      confirm-text="删除"
      @confirm="doDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useShines } from '../composables/useShines.js'
import ShineCard from '../components/ShineCard.vue'
import ShineStats from '../components/ShineStats.vue'
import ShineModal from '../components/ShineModal.vue'
import PhotoLightbox from '../components/PhotoLightbox.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const {
  shines,
  loading,
  currentFilter,
  filteredShines,
  favCount,
  streak,
  categoryIcon,
  filters,
  load,
  saveShine,
  update,
  remove,
  toggleFav
} = useShines()

const showModal = ref(false)
const editingShine = ref(null)
const lightboxItem = ref(null)
const deleteTarget = ref(null)

// 打开添加弹窗
function openAddModal() {
  editingShine.value = null
  showModal.value = true
}

// 打开编辑弹窗
function openEditModal(item) {
  editingShine.value = item
  showModal.value = true
}

// 关闭弹窗
function closeModal() {
  showModal.value = false
  editingShine.value = null
}

// 打开灯箱
function openLightbox(item) {
  lightboxItem.value = item
}

// 保存（新增/编辑）
async function handleSave(data) {
  if (data.id) {
    // 编辑
    const idx = shines.value.findIndex(s => s.id === data.id)
    if (idx !== -1) shines.value[idx] = data
  } else {
    // 新增
    shines.value.unshift(data)
  }
  closeModal()
}

// 确认删除
function confirmDelete(item) {
  deleteTarget.value = item
}

// 执行删除
async function doDelete() {
  if (deleteTarget.value) {
    await remove(deleteTarget.value.id)
    deleteTarget.value = null
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.shines-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px 40px;
}

/* 顶部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header-content {
  flex: 1;
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
  box-shadow: 0 8px 24px rgba(74, 222, 128, 0.3);
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 13px;
  color: var(--text2);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.filter-btn:hover:not(.active) {
  border-color: var(--accent);
  color: var(--accent);
}

/* 照片墙 */
.photo-wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* 空状态 */
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
  font-size: 16px;
  margin: 0 0 24px;
}

/* 加载 */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text3);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .photo-wall {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
}
</style>
