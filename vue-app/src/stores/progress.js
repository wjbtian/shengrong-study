import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProgressStore = defineStore('progress', () => {
  // State
  const subjects = ref({
    chinese: { completed: 0, total: 8, label: '语文' },
    math: { completed: 0, total: 6, label: '数学' },
    english: { completed: 0, total: 6, label: '英语' },
    olympiad: { completed: 0, total: 20, label: '奥数' }
  })
  
  const recentActivity = ref([])
  
  // Getters
  const overallProgress = computed(() => {
    const total = Object.values(subjects.value).reduce((sum, s) => sum + s.total, 0)
    const completed = Object.values(subjects.value).reduce((sum, s) => sum + s.completed, 0)
    return total > 0 ? Math.round((completed / total) * 100) : 0
  })
  
  const subjectList = computed(() => Object.entries(subjects.value).map(([key, data]) => ({
    key,
    ...data,
    percent: Math.round((data.completed / data.total) * 100)
  })))
  
  // Actions
  async function fetchProgress() {
    try {
      const res = await fetch('/api/progress')
      const data = await res.json()
      subjects.value = { ...subjects.value, ...data }
    } catch (err) {
      console.error('Failed to fetch progress:', err)
    }
  }
  
  async function updateSubject(subjectKey, completed) {
    try {
      await fetch('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subjectKey, completed })
      })
      if (subjects.value[subjectKey]) {
        subjects.value[subjectKey].completed = completed
      }
    } catch (err) {
      console.error('Failed to update progress:', err)
    }
  }
  
  async function fetchRecentActivity() {
    try {
      const res = await fetch('/api/activity?limit=10')
      recentActivity.value = await res.json()
    } catch (err) {
      console.error('Failed to fetch activity:', err)
    }
  }
  
  return {
    subjects,
    recentActivity,
    overallProgress,
    subjectList,
    fetchProgress,
    updateSubject,
    fetchRecentActivity
  }
})
