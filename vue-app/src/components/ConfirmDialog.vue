<template>
  <div v-if="show" class="confirm-overlay" @click.self="$emit('cancel')">
    <div class="confirm-dialog">
      <h3>{{ title || '确认操作' }}</h3>
      <p>{{ message || '确定要执行此操作吗？' }}</p>
      <div class="confirm-actions">
        <button class="btn" @click="$emit('cancel')">{{ cancelText || '取消' }}</button>
        <button class="btn btn-danger" @click="$emit('confirm')">{{ confirmText || '确定' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: String,
  message: String,
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' }
})
defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 600;
}

.confirm-dialog {
  background: var(--surface);
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 360px;
  text-align: center;
}

.confirm-dialog h3 {
  margin: 0 0 12px;
  font-size: 18px;
  color: var(--text);
}

.confirm-dialog p {
  margin: 0 0 20px;
  font-size: 14px;
  color: var(--text2);
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
}

.btn-danger {
  background: var(--error);
  border: none;
  color: white;
}

.btn:hover {
  transform: translateY(-1px);
}
</style>
