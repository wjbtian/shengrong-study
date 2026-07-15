<template>
  <section class="tasks-section">
    <div class="section-header">
      <h2>📋 今日任务</h2>
      <span class="task-progress">{{ completedTasks }}/{{ tasks.length }}</span>
    </div>
    <div class="task-list">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="task-item"
        :class="{ completed: task.completed }"
        @click="$emit('toggle', task.id)"
      >
        <div class="task-checkbox" :class="{ checked: task.completed }">
          <svg v-if="task.completed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span class="task-text">{{ task.text }}</span>
        <span class="task-tag" :class="task.category">{{ task.category }}</span>
      </div>
    </div>
    <div v-if="allTasksDone" class="tasks-celebrate">
      🎉 太棒了！今日任务全部完成！
    </div>
  </section>
</template>

<script setup>
defineProps({
  tasks: { type: Array, default: () => [] },
  completedTasks: { type: Number, default: 0 },
  allTasksDone: { type: Boolean, default: false }
})
defineEmits(['toggle'])
</script>

<style scoped>
.tasks-section {
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

.task-progress {
  font-size: 13px;
  color: var(--accent);
  font-weight: 700;
  background: var(--accent-dim);
  padding: 2px 10px;
  border-radius: 20px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--surface2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.task-item:hover {
  background: var(--surface3);
}

.task-item.completed {
  opacity: 0.5;
}

.task-item.completed .task-text {
  text-decoration: line-through;
  color: var(--text3);
}

.task-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.task-checkbox.checked {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
}

.task-checkbox svg {
  width: 12px;
  height: 12px;
}

.task-text {
  flex: 1;
  color: var(--text);
  font-size: 14px;
}

.task-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.task-tag.日记 { background: rgba(74, 222, 128, 0.15); color: #4ade80; }
.task-tag.吉他 { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
.task-tag.学习 { background: rgba(96, 165, 250, 0.15); color: #60a5fa; }
.task-tag.科技 { background: rgba(244, 114, 182, 0.15); color: #f472b6; }

.tasks-celebrate {
  text-align: center;
  padding: 16px;
  color: var(--accent);
  font-size: 15px;
  font-weight: 600;
  animation: celebrate 0.5s ease;
  margin-top: 12px;
}

@keyframes celebrate {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
</style>