<template>
  <div class="diary-card" :style="moodStyle">
    <div class="diary-header">
      <span class="diary-mood">{{ moodIcon }}</span>
      <span class="diary-title">{{ diary.title }}</span>
      <span class="diary-date">{{ diary.date }}</span>
    </div>
    <p class="diary-content">{{ diary.content }}</p>
    <div class="diary-tags" v-if="diary.tags?.length">
      <span v-for="tag in diary.tags" :key="tag" class="diary-tag">{{ tag }}</span>
    </div>
    <div class="diary-actions" @click.stop>
      <button class="diary-action" @click="$emit('edit')">✏️</button>
      <button class="diary-action" @click="$emit('delete')">🗑️</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { moodConfig } from '../composables/useDiary.js'

const props = defineProps({
  diary: { type: Object, required: true }
})

defineEmits(['edit', 'delete'])

const moodStyle = computed(() => {
  const cfg = moodConfig[props.diary.mood] || moodConfig.happy
  return { '--mood-color': cfg.color, '--mood-bg': cfg.bg }
})

const moodIcon = computed(() => moodConfig[props.diary.mood]?.icon || '📝')
</script>

<style scoped>
.diary-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  border-left: 4px solid var(--mood-color, #10b981);
  background: linear-gradient(135deg, var(--surface) 0%, var(--mood-bg, rgba(16, 185, 129, 0.05)) 100%);
  transition: all 0.2s;
}

.diary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.diary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.diary-mood {
  font-size: 24px;
}

.diary-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  flex: 1;
}

.diary-date {
  font-size: 13px;
  color: var(--text3);
}

.diary-content {
  margin: 0;
  font-size: 14px;
  color: var(--text);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.diary-tags {
  display: flex;
  gap: 6px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.diary-tag {
  font-size: 11px;
  padding: 2px 8px;
  background: var(--surface2);
  border-radius: 10px;
  color: var(--text2);
}

.diary-actions {
  display: flex;
  gap: 4px;
  margin-top: 12px;
}

.diary-action {
  padding: 4px 8px;
  background: var(--surface2);
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.diary-card:hover .diary-action {
  opacity: 1;
}

.diary-action:hover {
  background: var(--accent-dim);
}
</style>