<template>
  <div class="mood-filter">
    <div class="filter-scroll">
      <button
        v-for="f in filters"
        :key="f.value"
        class="filter-btn"
        :class="{ active: current === f.value }"
        @click="$emit('change', f.value)"
      >
        {{ f.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  filters: Array,
  current: String
})
defineEmits(['change'])
</script>

<style scoped>
.mood-filter {
  margin-bottom: 20px;
}

.filter-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}

.filter-scroll::-webkit-scrollbar {
  display: none;
}

.filter-btn {
  flex-shrink: 0;
  padding: 8px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 13px;
  color: var(--text2);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.filter-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.filter-btn:hover:not(.active) {
  border-color: var(--accent);
  color: var(--accent);
}
</style>
