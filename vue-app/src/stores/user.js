import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref({
    name: '永远的神',
    title: '四年级小学生',
    avatar: '🌱',
    streak: 0,
    totalPoints: 0
  })
  
  const isSidebarCollapsed = ref(false)
  
  // Getters
  const displayName = computed(() => user.value.name)
  const userTitle = computed(() => user.value.title)
  
  // Actions
  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }
  
  function updateStreak(days) {
    user.value.streak = days
  }
  
  function addPoints(points) {
    user.value.totalPoints += points
  }
  
  return {
    user,
    isSidebarCollapsed,
    displayName,
    userTitle,
    toggleSidebar,
    updateStreak,
    addPoints
  }
})
