<template>
  <header class="top-nav" :class="{ scrolled: isScrolled }">
    <div class="nav-brand">
      <div class="avatar">{{ userStore.user.avatar }}</div>
      <div class="brand-info">
        <span class="brand-name">{{ userStore.displayName }}</span>
        <span class="brand-sub">{{ userStore.userTitle }}</span>
      </div>
    </div>

    <nav class="nav-menu">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: $route.path === item.path }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span v-if="showText" class="nav-text">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="nav-actions">
      <button class="action-btn" @click="toggleTheme" title="切换主题">
        {{ isDark ? '🌙' : '☀️' }}
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'

const route = useRoute()
const userStore = useUserStore()
const isScrolled = ref(false)
const isDark = ref(true)
const showText = ref(window.innerWidth > 900)

function onScroll() {
  isScrolled.value = window.scrollY > 20
}

function toggleTheme() {
  isDark.value = !isDark.value
  // 实际主题切换逻辑可扩展
}

function onResize() {
  showText.value = window.innerWidth > 900
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
})

const navItems = [
  { path: '/', icon: '📊', label: '首页' },
  { path: '/diary', icon: '📔', label: '日记' },
  { path: '/chinese', icon: '📖', label: '语文' },
  { path: '/math', icon: '🔢', label: '数学' },
  { path: '/english', icon: '🔤', label: '英语' },
  { path: '/olympiad', icon: '🧮', label: '奥数' },
  { path: '/tech', icon: '🔬', label: '科技' },
  { path: '/guitar', icon: '🎸', label: '吉他' },
  { path: '/shines', icon: '✨', label: '时刻' }
]

// 根据屏幕宽度动态显示/隐藏文字

</script>

<style scoped>
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: rgba(8, 8, 16, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  z-index: 100;
  transition: all 0.3s;
}

.top-nav.scrolled {
  background: rgba(8, 8, 16, 0.95);
  box-shadow: 0 4px 30px rgba(0,0,0,0.3);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 0 20px rgba(74,222,128,0.3);
}

.brand-info {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 20px;
  font-weight: 800;
  color: var(--text);
}

.brand-sub {
  font-size: 13px;
  color: var(--text2);
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: var(--radius-sm);
  color: var(--text2);
  font-size: 17px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s;
  position: relative;
  white-space: nowrap;
}

.nav-item:hover {
  color: var(--text);
  background: var(--accent-dim);
}

.nav-item.active {
  color: var(--accent);
  background: var(--accent-dim);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 20%;
  right: 20%;
  height: 2px;
  background: var(--accent);
  border-radius: 2px;
}

.nav-icon {
  font-size: 20px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text2);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--accent);
}

@media (max-width: 900px) {
  .nav-text {
    display: none;
  }
  .nav-item {
    padding: 12px 14px;
  }
}

@media (max-width: 768px) {
  .top-nav {
    padding: 0 20px;
    height: 64px;
  }
  .brand-sub {
    display: none;
  }
  .nav-item {
    padding: 10px 12px;
  }
}

@media (max-width: 480px) {
  .nav-menu {
    gap: 4px;
  }
  .nav-item {
    padding: 8px 10px;
  }
  .nav-icon {
    font-size: 18px;
  }
}
</style>
