<template>
  <div class="subject-view">
    <!-- 顶部英雄区 -->
    <section class="subject-hero">
      <div class="subject-hero-main">
        <div class="subject-hero-icon">{{ icon }}</div>
        <div class="subject-hero-info">
          <h1 class="subject-hero-title">{{ title }}</h1>
          <p class="subject-hero-subtitle">{{ subtitle }}</p>
        </div>
      </div>
      <div class="subject-hero-progress">
        <div class="progress-ring-wrap">
          <svg viewBox="0 0 120 120" class="progress-ring">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
            <circle cx="60" cy="60" r="54" fill="none" :stroke="color" stroke-width="8"
              :stroke-dasharray="339.292"
              :stroke-dashoffset="339.292 - (339.292 * progressPercent / 100)"
              stroke-linecap="round"/>
          </svg>
          <div class="progress-ring-text">
            <div class="progress-percent" :style="{ color }">{{ progressPercent }}%</div>
          </div>
        </div>
        <div class="progress-count">{{ doneCount }} / {{ total }} {{ unitLabel }}</div>
      </div>
    </section>

    <!-- 统计卡片 -->
    <div class="stats-row" v-if="stats.length">
      <div v-for="(stat, idx) in stats" :key="idx" class="stat-card">
        <span class="stat-value" :style="{ color }">{{ stat.value }}</span>
        <span class="stat-label" style="margin-left: 8px;">{{ stat.label }}</span>
      </div>
    </div>

    <!-- 内容插槽 -->
    <slot />
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '📚' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  color: { type: String, default: '#4ade80' },
  progressPercent: { type: Number, default: 0 },
  doneCount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  unitLabel: { type: String, default: '单元' },
  stats: { type: Array, default: () => [] }
})
</script>

<style scoped>
.subject-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 50px 12px 0;
  box-sizing: border-box;
}

/* 英雄区 */
.subject-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px;
  background: linear-gradient(135deg, v-bind('color + "14"') 0%, rgba(129, 140, 248, 0.05) 100%);
  border-radius: 16px;
  border: 1px solid v-bind('color + "26"');
  margin-bottom: 24px;
}

.subject-hero-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.subject-hero-icon {
  font-size: 48px;
}

.subject-hero-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 4px;
}

.subject-hero-subtitle {
  font-size: 14px;
  color: var(--text2);
}

.subject-hero-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.progress-ring-wrap {
  position: relative;
  width: 100px;
  height: 100px;
}

.progress-ring {
  width: 100px;
  height: 100px;
  transform: rotate(-90deg);
}

.progress-ring circle {
  transition: stroke-dashoffset 0.5s ease;
}

.progress-ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-percent {
  font-size: 20px;
  font-weight: 700;
}

.progress-count {
  font-size: 13px;
  color: var(--text2);
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

.stat-value {
  font-size: 32px;
  font-weight: 700;
}

.stat-label {
  font-size: 14px;
  color: var(--text2);
  margin-left: 8px;
}

@media (max-width: 768px) {
  .subject-hero {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  .stats-row {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
