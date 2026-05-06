<template>
  <section class="badges-section">
    <div class="section-header">
      <h2>🏅 成就徽章</h2>
      <span class="badge-count">{{ unlockedBadges }}/{{ badges.length }}</span>
    </div>
    <div class="badges-grid">
      <div
        v-for="badge in badges.slice(0, 8)"
        :key="badge.id"
        class="badge-item"
        :class="{ unlocked: badge.unlocked, mystery: badge.isMystery }"
        :title="badge.desc"
      >
        <div class="badge-glow" v-if="badge.unlocked"></div>
        <div class="badge-icon">{{ badge.icon }}</div>
        <div class="badge-name">{{ badge.name }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  badges: { type: Array, default: () => [] },
  unlockedBadges: { type: Number, default: 0 }
})
</script>

<style scoped>
.badges-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.badge-count {
  font-size: 13px;
  color: var(--accent);
  font-weight: 700;
  background: var(--accent-dim);
  padding: 2px 10px;
  border-radius: 20px;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 8px;
  border-radius: 12px;
  background: var(--surface2);
  transition: all 0.3s;
  position: relative;
  cursor: pointer;
}

.badge-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.badge-item.unlocked {
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(129, 140, 248, 0.1));
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.badge-item.mystery {
  opacity: 0.4;
}

.badge-glow {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: radial-gradient(circle at center, rgba(74, 222, 128, 0.2), transparent 70%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.badge-icon {
  font-size: 28px;
  position: relative;
  z-index: 1;
}

.badge-name {
  font-size: 12px;
  color: var(--text2);
  text-align: center;
  position: relative;
  z-index: 1;
  font-weight: 500;
}
</style>