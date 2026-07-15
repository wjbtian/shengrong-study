<template>
  <section class="mood-stats-section">
    <div class="section-header">
      <h2>😊 心情分布</h2>
    </div>
    <div class="mood-content">
      <!-- 心情列表 -->
      <div class="mood-list">
        <div 
          v-for="item in distribution" 
          :key="item.mood" 
          class="mood-item"
        >
          <span class="mood-emoji">{{ item.mood }}</span>
          <div class="mood-bar-bg">
            <div 
              class="mood-bar-fill" 
              :style="{ width: item.percent + '%', background: item.color }"
            ></div>
          </div>
          <span class="mood-percent">{{ item.percent }}%</span>
        </div>
      </div>
      <!-- 最近心情 -->
      <div class="recent-moods" v-if="recent.length">
        <span class="recent-label">最近：</span>
        <span 
          v-for="(item, idx) in recent" 
          :key="idx" 
          class="recent-mood"
          :title="item.date"
        >
          {{ item.mood }}
        </span>
      </div>
      <div v-else class="empty-mood">
        暂无心情记录
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  distribution: {
    type: Array,
    default: () => []
  },
  recent: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.mood-stats-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
}

.section-header {
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.mood-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mood-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mood-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mood-emoji {
  font-size: 18px;
  width: 28px;
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
  transition: width 0.3s;
}

.mood-percent {
  font-size: 12px;
  color: var(--text3);
  width: 36px;
  text-align: right;
}

.recent-moods {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.recent-label {
  font-size: 12px;
  color: var(--text3);
}

.recent-mood {
  font-size: 18px;
  cursor: default;
}

.empty-mood {
  text-align: center;
  color: var(--text3);
  font-size: 13px;
  padding: 20px;
}
</style>