<template>
  <div class="shine-stats">
    <div class="stat-card">
      <span class="stat-icon">🏆</span>
      <span class="stat-value">{{ total }}</span>
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
</template>

<script setup>
defineProps({
  total: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  favCount: { type: Number, default: 0 }
})
</script>

<style scoped>
.shine-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  font-size: 24px;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--text);
}

.stat-label {
  font-size: 13px;
  color: var(--text3);
}
</style>