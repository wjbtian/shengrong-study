<template>
  <div class="diary-view">
    <h1 class="page-title">📔 成长日记</h1>
    <div class="mood-selector">
      <button
        v-for="mood in moods"
        :key="mood"
        class="mood-btn"
        :class="{ active: selectedMood === mood }"
        @click="selectedMood = mood"
      >
        {{ mood }}
      </button>
    </div>
    <div class="diary-form">
      <textarea
        v-model="diaryContent"
        placeholder="今天发生了什么有趣的事？"
        rows="4"
      />
      <button class="btn-primary" @click="saveDiary" :disabled="saving">
        {{ saving ? '保存中...' : '保存日记' }}
      </button>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="diary-list">
      <div v-for="entry in diary" :key="entry.id" class="diary-card">
        <div class="diary-mood">{{ entry.mood }}</div>
        <div class="diary-content">{{ entry.content }}</div>
        <div class="diary-date">{{ formatDate(entry.date) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDiary, postDiary } from '../utils/api.js'

const moods = ['😄','🤩','😊','🙂','😐','😔','😤','😢']
const selectedMood = ref('😄')
const diaryContent = ref('')
const diary = ref([])
const loading = ref(true)
const saving = ref(false)

const loadDiary = async () => {
  try {
    diary.value = await getDiary()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const saveDiary = async () => {
  if (!diaryContent.value.trim()) return
  saving.value = true
  try {
    await postDiary({
      mood: selectedMood.value,
      content: diaryContent.value,
      date: new Date().toISOString()
    })
    diaryContent.value = ''
    await loadDiary()
  } catch (e) {
    alert('保存失败')
  } finally {
    saving.value = false
  }
}

const formatDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return `${date.getMonth()+1}月${date.getDate()}日`
}

onMounted(loadDiary)
</script>

<style scoped>
.page-title {
  font-size: 28px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #4ade80, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.mood-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.mood-btn {
  font-size: 24px;
  padding: 8px 12px;
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.mood-btn.active {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
}
.diary-form {
  margin-bottom: 24px;
}
.diary-form textarea {
  width: 100%;
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.6);
  color: #e2e8f0;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 12px;
}
.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: #0f172a;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-primary:hover { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.diary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.diary-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  padding: 20px;
}
.diary-mood {
  font-size: 32px;
  margin-bottom: 8px;
}
.diary-content {
  color: #e2e8f0;
  line-height: 1.6;
  margin-bottom: 12px;
}
.diary-date {
  font-size: 12px;
  color: #64748b;
}
</style>
