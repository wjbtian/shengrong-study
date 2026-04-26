<template>
  <div class="home-view">
    <h1 class="page-title">📊 成长仪表盘</h1>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="dashboard">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ diary.length }}</div>
          <div class="stat-label">日记篇数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ shines.length }}</div>
          <div class="stat-label">闪光时刻</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ guitar.length }}</div>
          <div class="stat-label">吉他练习</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ tech.length }}</div>
          <div class="stat-label">科技探索</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDiary, getShines, getGuitar, getTech } from '../utils/api.js'

const diary = ref([])
const shines = ref([])
const guitar = ref([])
const tech = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const [d, s, g, t] = await Promise.all([
      getDiary().catch(() => []),
      getShines().catch(() => []),
      getGuitar().catch(() => []),
      getTech().catch(() => [])
    ])
    diary.value = d
    shines.value = s
    guitar.value = g
    tech.value = t
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-title {
  font-size: 28px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #4ade80, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
.stat-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}
.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #4ade80;
}
.stat-label {
  font-size: 14px;
  color: #94a3b8;
  margin-top: 8px;
}
</style>
