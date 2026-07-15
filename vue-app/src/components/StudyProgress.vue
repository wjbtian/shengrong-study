<template>
  <section class="progress-section">
    <div class="section-header">
      <h2>📚 学习进度</h2>
    </div>
    <div class="progress-list">
      <div 
        v-for="subject in subjects" 
        :key="subject.key" 
        class="progress-item" 
        :title="`${subject.name}: ${subject.completed}/${subject.total}`"
      >
        <div class="progress-left">
          <span class="progress-icon">{{ subject.icon }}</span>
          <span class="progress-name">{{ subject.name }}</span>
          <span class="progress-fraction">{{ subject.completed }}/{{ subject.total }}</span>
        </div>
        <div class="progress-bar-bg">
          <div
            class="progress-bar-fill"
            :style="{ width: subject.percent + '%', background: subject.color }"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  subjects: { type: Array, default: () => [] }
})
</script>

<style scoped>
.progress-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 16px;
  font-weight: 800;
  color: var(--text);
  margin: 0;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.progress-name {
  font-size: 14px;
  color: var(--text);
  font-weight: 600;
  min-width: 36px;
  flex-shrink: 0;
}

.progress-fraction {
  margin-left: auto;
  font-size: 13px;
  color: var(--text3);
  font-weight: 500;
}

.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: var(--surface2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.3);
}
</style>