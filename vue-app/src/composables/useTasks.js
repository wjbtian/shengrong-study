// 今日任务 - localStorage 持久化
import { ref, computed } from 'vue'

const DEFAULT_TASKS = [
  { id: 1, text: '写一篇日记', completed: false, category: '日记' },
  { id: 2, text: '练习吉他30分钟', completed: false, category: '吉他' },
  { id: 3, text: '完成今日学习任务', completed: false, category: '学习' },
  { id: 4, text: '阅读一篇科技新闻', completed: false, category: '科技' },
]

function getToday() {
  return new Date().toISOString().split('T')[0]
}

export function useTasks() {
  const tasks = ref(loadTasks())

  function loadTasks() {
    const today = getToday()
    const saved = localStorage.getItem('tasks_' + today)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        return DEFAULT_TASKS.map(t => ({ ...t }))
      }
    }
    return DEFAULT_TASKS.map(t => ({ ...t }))
  }

  function saveTasks() {
    const today = getToday()
    localStorage.setItem('tasks_' + today, JSON.stringify(tasks.value))
  }

  function toggleTask(id) {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      task.completed = !task.completed
      saveTasks()
    }
  }

  const completedTasks = computed(() => tasks.value.filter(t => t.completed).length)
  const allTasksDone = computed(() => completedTasks.value === tasks.value.length)

  return { tasks, toggleTask, completedTasks, allTasksDone }
}
