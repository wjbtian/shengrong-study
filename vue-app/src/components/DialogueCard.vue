<template>
  <div class="dialogue-card">
    <h4 class="dialogue-title">{{ dialogue.title }}</h4>
    <div class="dialogue-content">
      <div v-for="(line, i) in dialogue.lines" :key="i" class="dialogue-line" :class="line.speaker">
        <span class="speaker">{{ line.speaker }}:</span>
        <span class="text">{{ line.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  dialogue: { type: Object, required: true }
})
</script>

<style scoped>
.dialogue-card {
  padding: 16px;
  background: var(--surface2);
  border-radius: 10px;
}

.dialogue-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 10px;
}

.dialogue-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dialogue-line {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.dialogue-line .speaker {
  font-weight: 600;
  color: var(--accent);
  min-width: 24px;
}

.dialogue-line .text {
  color: var(--text);
}
</style>
