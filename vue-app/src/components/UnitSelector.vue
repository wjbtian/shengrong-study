<template>
  <div class="unit-selector">
    <div
      class="unit-tab"
      :class="{ active: modelValue === -1 }"
      @click="$emit('update:modelValue', -1)"
    >
      <span class="unit-tab-icon">📚</span>
      <span class="unit-tab-label">全部</span>
    </div>
    <div
      v-for="(unit, idx) in units"
      :key="idx"
      class="unit-tab"
      :class="{ active: modelValue === idx }"
      @click="$emit('update:modelValue', idx)"
    >
      <span class="unit-tab-icon">{{ unit.icon }}</span>
      <span class="unit-tab-label">{{ unit.label }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  units: { type: Array, default: () => [] },
  modelValue: { type: Number, default: 0 }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.unit-selector {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
}

.unit-selector::-webkit-scrollbar {
  height: 4px;
}

.unit-selector::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

.unit-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--surface2);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  white-space: nowrap;
  flex-shrink: 0;
}

.unit-tab:hover {
  background: var(--surface3);
  transform: translateY(-1px);
}

.unit-tab.active {
  border-color: #f472b6;
  background: linear-gradient(135deg, rgba(244, 114, 182, 0.2), rgba(129, 140, 248, 0.2));
  box-shadow: 0 2px 8px rgba(244, 114, 182, 0.3);
}

.unit-tab-icon {
  font-size: 16px;
}

.unit-tab-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}
</style>
