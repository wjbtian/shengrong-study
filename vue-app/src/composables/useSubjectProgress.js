import { ref, computed, onMounted } from 'vue'
import { getProgress } from '../utils/api.js'

export function useSubjectProgress(subjectPrefix, totalUnits) {
  const progress = ref({})
  const units = ref([])
  
  const doneCount = computed(() => {
    const done = progress.value?.doneUnits || []
    return done.filter(u => u.startsWith(subjectPrefix)).length
  })
  
  const progressPercent = computed(() => 
    Math.round((doneCount.value / totalUnits) * 100)
  )
  
  async function loadProgress() {
    try {
      const p = await getProgress().catch(() => ({}))
      progress.value = p
      const done = p?.doneUnits || []
      units.value.forEach(u => {
        u.completed = done.includes(u.id)
      })
    } catch (e) {
      console.error('加载进度失败:', e)
    }
  }
  
  onMounted(loadProgress)
  
  return {
    progress,
    units,
    doneCount,
    progressPercent,
    loadProgress
  }
}
