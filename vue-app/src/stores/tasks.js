import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTaskStore = defineStore('tasks', () => {
  // State
  const tasks = ref([])
  const loading = ref(false)
  
  // Getters
  const completedTasks = computed(() => tasks.value.filter(t => t.completed))
  const pendingTasks = computed(() => tasks.value.filter(t => !t.completed))
  const completionRate = computed(() => {
    if (tasks.value.length === 0) return 0
    return Math.round((completedTasks.value.length / tasks.value.length) * 100)
  })
  
  // Actions
  async function fetchTasks() {
    loading.value = true
    try {
      const res = await fetch('/api/tasks')
      tasks.value = await res.json()
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    } finally {
      loading.value = false
    }
  }
  
  async function toggleTask(id) {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return
    
    const newStatus = !task.completed
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newStatus })
      })
      task.completed = newStatus
    } catch (err) {
      console.error('Failed to toggle task:', err)
    }
  }
  
  async function addTask(task) {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      })
      const newTask = await res.json()
      tasks.value.push(newTask)
    } catch (err) {
      console.error('Failed to add task:', err)
    }
  }
  
  return {
    tasks,
    loading,
    completedTasks,
    pendingTasks,
    completionRate,
    fetchTasks,
    toggleTask,
    addTask
  }
})
