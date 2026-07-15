import { createPinia } from 'pinia'

export default createPinia()

// 导出所有 store
export { useUserStore } from './user'
export { useTaskStore } from './tasks'
export { useProgressStore } from './progress'
