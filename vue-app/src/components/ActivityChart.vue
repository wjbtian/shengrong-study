<template>
  <section class="activity-section">
    <div class="section-header">
      <h2>📊 本周活跃度</h2>
    </div>
    <div class="activity-chart">
      <div v-for="day in data" :key="day.label" class="activity-column">
        <div class="activity-bars">
          <div 
            class="activity-bar diary" 
            :style="{ height: day.diaryHeight + 'px' }"
            title="日记"
          ></div>
          <div 
            class="activity-bar shine" 
            :style="{ height: day.shineHeight + 'px' }"
            title="闪光"
          ></div>
          <div 
            class="activity-bar guitar" 
            :style="{ height: day.guitarHeight + 'px' }"
            title="吉他"
          ></div>
        </div>
        <span class="activity-label" :class="{ today: day.isToday }">
          {{ day.label }}
        </span>
      </div>
    </div>
    <div class="activity-legend">
      <span class="legend-item"><span class="dot diary"></span>日记</span>
      <span class="legend-item"><span class="dot shine"></span>闪光</span>
      <span class="legend-item"><span class="dot guitar"></span>吉他</span>
    </div>
  </section>
</template>

<script setup>
defineProps({
  data: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.activity-section {
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

.activity-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 120px;
  padding: 0 10px;
  margin-bottom: 12px;
}

.activity-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.activity-bars {
  display: flex;
  gap: 3px;
  align-items: flex-end;
  height: 100px;
  width: 100%;
  justify-content: center;
}

.activity-bar {
  width: 12px;
  min-height: 4px;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
}

.activity-bar.diary {
  background: linear-gradient(to top, #4ade80, #22c55e);
}

.activity-bar.shine {
  background: linear-gradient(to top, #fbbf24, #f59e0b);
}

.activity-bar.guitar {
  background: linear-gradient(to top, #f472b6, #ec4899);
}

.activity-label {
  font-size: 12px;
  color: var(--text3);
}

.activity-label.today {
  color: var(--accent);
  font-weight: 600;
}

.activity-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 12px;
  color: var(--text2);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.diary { background: #4ade80; }
.dot.shine { background: #fbbf24; }
.dot.guitar { background: #f472b6; }
</style>