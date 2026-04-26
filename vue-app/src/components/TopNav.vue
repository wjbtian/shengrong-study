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
        <span class="nav-text">{{ item.label }}</span>
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

function onScroll() {
  isScrolled.value = window.scrollY > 20
}

function toggleTheme() {
  isDark.value = !isDark.value
  // 实际主题切换逻辑可扩展
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
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
  { path: '/shines', icon: '✨', label: '闪光' }
]
</script>

<style scoped>
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(8, 8, 16, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
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
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 0 20px rgba(74,222,128,0.3);
}

.brand-info {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.brand-sub {
  font-size: 11px;
  color: var(--text2);
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  color: var(--text2);
  font-size: 14px;
  text-decoration: none;
  transition: all 0.25s;
  position: relative;
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
  font-size: 16px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text2);
  font-size: 16px;
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

@media (max-width: 1024px) {
  .nav-text {
    display: none;
  }
  .nav-item {
    padding: 8px 12px;
  }
}

@media (max-width: 768px) {
  .top-nav {
    padding: 0 16px;
  }
  .brand-sub {
    display: none;
  }
}
</style>
