<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ diary ? '✏️ 编辑日记' : '📝 写日记' }}</h3>
        <button class="modal-close" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <!-- 心情选择 -->
        <div class="mood-selector">
          <p class="mood-label">今天心情</p>
          <div class="mood-buttons">
            <button
              v-for="(cfg, key) in moodConfig"
              :key="key"
              class="mood-btn"
              :class="{ active: form.mood === key }"
              :style="form.mood === key ? { background: cfg.bg, borderColor: cfg.color } : {}"
              @click="form.mood = key"
            >
              <span class="mood-icon">{{ cfg.icon }}</span>
              <span class="mood-text">{{ cfg.label }}</span>
            </button>
          </div>
        </div>

        <!-- 内容 -->
        <textarea
          v-model="form.content"
          class="textarea"
          rows="6"
          placeholder="今天发生了什么？"
        ></textarea>

        <!-- 标签 -->
        <input
          v-model="form.tagsInput"
          class="input"
          placeholder="标签（逗号分隔，如：学习,运动）"
        >
      </div>
      <div class="modal-footer">
        <button class="btn" @click="$emit('close')">取消</button>
        <button class="btn btn-primary" @click="save" :disabled="!form.content.trim()">
          保存
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { moodConfig } from '../composables/useDiary.js'

const props = defineProps({
  show: Boolean,
  diary: { type: Object, default: null }
})

const emit = defineEmits(['close', 'save'])

const form = ref({ mood: 'happy', content: '', tagsInput: '' })

watch(() => props.diary, (d) => {
  if (d) {
    form.value = {
      mood: d.mood || 'happy',
      content: d.content || '',
      tagsInput: d.tags?.join(', ') || ''
    }
  } else {
    form.value = { mood: 'happy', content: '', tagsInput: '' }
  }
}, { immediate: true })

function save() {
  const tags = form.value.tagsInput
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
  
  emit('save', {
    ...(props.diary?.id ? { id: props.diary.id } : {}),
    mood: form.value.mood,
    content: form.value.content.trim(),
    tags
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 400;
  padding: 20px;
}

.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text3);
  cursor: pointer;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mood-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mood-label {
  margin: 0;
  font-size: 14px;
  color: var(--text2);
  font-weight: 500;
}

.mood-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mood-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: var(--surface2);
  border: 2px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.mood-btn:hover {
  transform: scale(1.05);
}

.mood-icon {
  font-size: 18px;
}

.mood-text {
  font-size: 12px;
  color: var(--text2);
}

.input, .textarea {
  width: 100%;
  padding: 12px 16px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  color: var(--text);
  box-sizing: border-box;
}

.input:focus, .textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.textarea {
  resize: vertical;
  min-height: 120px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}

.btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:not(.btn-primary) {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
}

.btn-primary {
  background: var(--accent);
  border: none;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
