<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ edit ? '✏️ 编辑闪光时刻' : '📸 记录闪光时刻' }}</h3>
        <button class="modal-close" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <input v-model="form.title" class="input" placeholder="标题 *">
        <select v-model="form.category" class="input">
          <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
        </select>
        <textarea v-model="form.desc" class="textarea" rows="3" placeholder="描述（可选）"></textarea>

        <!-- 照片上传 -->
        <div class="photo-upload-area">
          <div class="uploaded-previews">
            <div v-for="(url, idx) in photoUrls" :key="idx" class="preview-item">
              <img :src="url" class="preview-img">
              <button class="preview-remove" @click="removePhoto(idx)">✕</button>
            </div>
          </div>
          <label class="upload-btn">
            <span>➕ 添加照片</span>
            <input type="file" accept="image/*" multiple @change="onPhotoChange" style="display:none">
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" @click="$emit('close')">取消</button>
        <button class="btn btn-primary" @click="save" :disabled="saving">
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { categories } from '../composables/useShines.js'
import { uploadFile } from '../utils/api.js'

const props = defineProps({
  show: { type: Boolean, default: false },
  edit: { type: Object, default: null }
})

const emit = defineEmits(['close', 'save'])

const saving = ref(false)
const form = ref({ title: '', category: 'other', desc: '' })
const photos = ref([])
const photoUrls = ref([])

// 监听编辑数据
watch(() => props.edit, (item) => {
  if (item) {
    form.value = { 
      id: item.id,
      title: item.title, 
      category: item.category, 
      desc: item.desc || '' 
    }
    // 解析已有照片
    try {
      const arr = typeof item.photos === 'string' ? JSON.parse(item.photos) : item.photos || []
      photoUrls.value = arr.length ? arr : (item.photoUrl ? [item.photoUrl] : [])
    } catch {
      photoUrls.value = item.photoUrl ? [item.photoUrl] : []
    }
    photos.value = []
  } else {
    form.value = { title: '', category: 'other', desc: '' }
    photoUrls.value = []
    photos.value = []
  }
}, { immediate: true })

function onPhotoChange(e) {
  const files = Array.from(e.target.files || [])
  files.forEach(file => {
    const url = URL.createObjectURL(file)
    photos.value.push(file)
    photoUrls.value.push(url)
  })
  e.target.value = ''
}

function removePhoto(idx) {
  photos.value.splice(idx, 1)
  photoUrls.value.splice(idx, 1)
}

async function save() {
  if (!form.value.title.trim()) return
  saving.value = true
  try {
    const photoUrls = []
    for (const file of photos.value) {
      const url = await uploadFile(file, 'image')
      photoUrls.push(url)
    }
    
    const data = {
      ...form.value,
      photoUrl: photoUrls[0] || '',
      photos: [...photoUrls.value.filter(u => !u.startsWith('blob:')), ...photoUrls]
    }
    
    emit('save', props.edit?.id ? { id: props.edit.id, ...data } : data)
  } finally {
    saving.value = false
  }
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
  padding: 4px;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  min-height: 80px;
}

.photo-upload-area {
  border: 2px dashed var(--border);
  border-radius: 12px;
  padding: 16px;
}

.uploaded-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.preview-item {
  position: relative;
  width: 80px;
  height: 80px;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.preview-remove {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--error);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  cursor: pointer;
}

.upload-btn {
  display: block;
  text-align: center;
  padding: 12px;
  background: var(--surface2);
  border-radius: 8px;
  cursor: pointer;
  color: var(--accent);
  font-size: 14px;
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