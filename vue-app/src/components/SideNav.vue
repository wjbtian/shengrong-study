<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- 顶部品牌区 -->
    <div class="sidebar-top">
      <div class="avatar">
        {{ userStore.user.avatar }}
      </div>
      <div class="sidebar-info" v-show="!isCollapsed">
        <div class="sidebar-name">{{ userStore.displayName }}</div>
        <div class="sidebar-sub">{{ userStore.userTitle }}</div>
      </div>
      <button class="sidebar-toggle" @click="toggleSidebar">
        {{ isCollapsed ? '→' : '←' }}
      </button>
    </div>
    
    <!-- 导航菜单 -->
    <nav class="nav-section">
      <div class="nav-label" v-show="!isCollapsed">菜单</div>
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: $route.path === item.path }"
        @click="createRipple"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-text" v-show="!isCollapsed">{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'

const route = useRoute()
const userStore = useUserStore()

const isCollapsed = computed(() => userStore.isSidebarCollapsed)

function toggleSidebar() {
  userStore.toggleSidebar()
}

function createRipple(event) {
  const button = event.currentTarget
  const circle = document.createElement('span')
  const diameter = Math.max(button.clientWidth, button.clientHeight)
  const radius = diameter / 2
  
  circle.style.width = circle.style.height = `${diameter}px`
  circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`
  circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`
  circle.classList.add('ripple')
  
  const ripple = button.getElementsByClassName('ripple')[0]
  if (ripple) ripple.remove()
  
  button.appendChild(circle)
}

const navItems = [
  { path: '/', icon: '📊', label: '首页' },
  { path: '/diary', icon: '📔', label: '日记' },
  { path: '/chinese', icon: '📖', label: '语文' },
  { path: '/math', icon: '🔢', label: '数学' },
  { path: '/english', icon: '🔤', label: '英语' },
  { path: '/olympiad', icon: '🧮', label: '奥数' },
  { path: '/tech', icon: '🔬', label: '科技' },
  { path: '/guitar', icon: '🎸', label: '吉他' },
  { path: '/shines', icon: '✨', label: '闪光时刻' }
]
</script>

<style scoped>
.sidebar {
  width: 240px;
  min-width: 240px;
  height: 100vh;
  background: linear-gradient(180deg, rgba(10,10,20,0.95) 0%, rgba(15,15,26,0.98) 50%, var(--surface) 100%);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  overflow: hidden;
  transition: width 0.35s var(--ease-smooth), min-width 0.35s var(--ease-smooth);
  z-index: 10;
  backdrop-filter: blur(20px);
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(180deg, rgba(74,222,128,0.04) 0%, transparent 100%);
  pointer-events: none;
}

.sidebar.collapsed {
  width: 72px;
  min-width: 72px;
}

.sidebar-top {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(74,222,128,0.03) 0%, transparent 100%);
  position: relative;
}

.avatar {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
  box-shadow: 0 0 24px rgba(74,222,128,0.35), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
  position: relative;
  overflow: hidden;
  transition: transform 0.4s var(--ease-spring), box-shadow 0.4s;
  cursor: pointer;
}

.avatar:hover {
  transform: scale(1.12) rotate(-8deg);
  box-shadow: 0 0 32px rgba(74,222,128,0.5), 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3);
}

.sidebar-info {
  flex: 1;
  min-width: 0;
}

.sidebar.collapsed .sidebar-info { display: none; }

.sidebar-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.5px;
}

.sidebar-sub {
  font-size: 12px;
  color: var(--text2);
  margin-top: 4px;
  font-weight: 500;
}

.sidebar-toggle {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text2);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.sidebar-toggle:hover {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--accent);
}

.nav-section {
  padding: 16px 12px;
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.nav-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 2px;
  padding: 10px 14px 6px;
  margin-bottom: 6px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-label::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.5;
}

.sidebar.collapsed .nav-label { display: none; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 14px;
  color: var(--text2);
  transition: all 0.3s var(--ease-smooth);
  border-left: 3px solid transparent;
  white-space: nowrap;
  overflow: hidden;
  margin-bottom: 3px;
  position: relative;
  text-decoration: none;
}

.nav-item::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--accent-dim), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}

.nav-item:hover {
  color: var(--text);
  transform: translateX(5px);
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-item.active {
  background: var(--accent-dim);
  border-left-color: var(--accent);
  color: var(--accent);
}

.nav-item .ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(74, 222, 128, 0.3);
  transform: scale(0);
  animation: ripple-effect 0.6s ease-out;
  pointer-events: none;
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.nav-text {
  font-size: 14px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  .sidebar.collapsed {
    width: 100%;
  }
}
</style>
