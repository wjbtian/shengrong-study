<template>
  <header class="top-nav" :class="{ scrolled: isScrolled, 'study-mode': isStudyMode }">
    <div class="nav-inner">
      <!-- Logo / 品牌 -->
      <router-link to="/" class="nav-brand" @click.native="isStudyMode && toggleMode()">
        <div class="brand-icon-wrap">
          <span class="brand-icon">{{ isStudyMode ? '🚀' : '🌟' }}</span>
          <span class="brand-glow"></span>
        </div>
        <div class="brand-text">
          <span class="brand-name">{{ isStudyMode ? '探索中心' : userStore.displayName || '尚融' }}</span>
          <span class="brand-sub">{{ isStudyMode ? '学知识 · 闯星河' : userStore.userTitle || '成长星球' }}</span>
        </div>
      </router-link>

      <!-- 桌面导航 -->
      <nav class="nav-menu desktop-nav" ref="menuRef">
        <template v-if="!isStudyMode">
          <router-link v-for="item in homeNav" :key="item.path" :to="item.path"
            class="nav-item" :class="{ active: $route.path === item.path }">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.label }}</span>
            <span class="nav-indicator"></span>
          </router-link>
        </template>
        <template v-else>
          <router-link v-for="item in studyNav" :key="item.path" :to="item.path"
            class="nav-item" :class="{ active: isActive(item.path) }">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.label }}</span>
            <span class="nav-indicator"></span>
          </router-link>
        </template>
      </nav>

      <!-- 模式切换按钮（太空船风格） -->
      <button class="mode-btn" :class="{ study: isStudyMode }" @click="toggleMode">
        <div class="mode-btn-inner">
          <div class="mode-icon-wrap">
            <span class="mode-icon">{{ isStudyMode ? '🌍' : '🚀' }}</span>
          </div>
          <span class="mode-text">{{ isStudyMode ? '返回星球' : '探索中心' }}</span>
        </div>
        <div class="mode-glow"></div>
      </button>
    </div>

    <!-- 移动端底部 Dock -->
    <nav class="mobile-dock" v-if="showMobileDock">
      <template v-if="!isStudyMode">
        <router-link v-for="item in mobileHomeNav" :key="item.path" :to="item.path"
          class="dock-item" :class="{ active: $route.path === item.path }">
          <span class="dock-icon">{{ item.icon }}</span>
          <span class="dock-label">{{ item.label }}</span>
        </router-link>
      </template>
      <template v-else>
        <router-link v-for="item in mobileStudyNav" :key="item.path" :to="item.path"
          class="dock-item" :class="{ active: isActive(item.path) }">
          <span class="dock-icon">{{ item.icon }}</span>
          <span class="dock-label">{{ item.label }}</span>
        </router-link>
      </template>
    </nav>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isScrolled = ref(false)
const isStudyMode = ref(false)
const showMobileDock = ref(false)
const menuRef = ref(null)

const studyPaths = ['/study']

watch(() => route.path, (path) => {
  isStudyMode.value = studyPaths.some(p => path.startsWith(p))
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}, { immediate: true })

function isActive(path) {
  if (path === '/study') return route.path === '/study'
  return route.path.startsWith(path)
}

function toggleMode() {
  if (isStudyMode.value) {
    router.push('/')
  } else {
    router.push('/study')
  }
}

function onScroll() { isScrolled.value = window.scrollY > 15 }
function onResize() { showMobileDock.value = window.innerWidth <= 768 }

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  onResize()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
})

const homeNav = [
  { path: '/', icon: '🏠', label: '首页' },
  { path: '/diary', icon: '📔', label: '日记' },
  { path: '/shines', icon: '✨', label: '闪光' },
  { path: '/tech', icon: '🔬', label: '科技' },
  { path: '/guitar', icon: '🎸', label: '吉他' }
]
const studyNav = [
  { path: '/study', icon: '🏠', label: '仪表盘' },
  { path: '/study/knowledge-tree', icon: '🌳', label: '知识树' },
  { path: '/study/print', icon: '🖨️', label: '打印' },
  { path: '/study/report', icon: '📊', label: '报告' },
  { path: '/study/errors', icon: '📝', label: '错题' },
  { path: '/study/methods', icon: '💡', label: '方法' },
  { path: '/study/chinese', icon: '📖', label: '语文' },
  { path: '/study/math', icon: '🔢', label: '数学' },
  { path: '/study/english', icon: '🔤', label: '英语' }
]

// 移动端只用最核心的几个
const mobileHomeNav = homeNav.slice(0, 5)
const mobileStudyNav = studyNav.slice(0, 6)
</script>

<style scoped>
.top-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(7,6,15,0.5);
  backdrop-filter: blur(20px) saturate(2);
  -webkit-backdrop-filter: blur(20px) saturate(2);
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: all 0.4s ease;
}
.top-nav.scrolled {
  background: rgba(7,6,15,0.85);
  box-shadow: 0 4px 30px rgba(0,0,0,0.5);
  border-bottom-color: rgba(74,222,128,0.06);
}

/* 内包装 */
.nav-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center;
  height: 60px; padding: 0 24px; gap: 12px;
}

/* ===== 品牌 ===== */
.nav-brand {
  display: flex; align-items: center; gap: 10px;
  flex-shrink: 0; text-decoration: none;
  cursor: pointer;
}
.brand-icon-wrap {
  position: relative;
  width: 38px; height: 38px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  background: linear-gradient(135deg, rgba(74,222,128,0.15), rgba(129,140,248,0.15));
  overflow: hidden;
}
.brand-glow {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(74,222,128,0.2), transparent 70%);
  animation: pulse-glow 3s ease-in-out infinite;
}
.brand-icon { position: relative; z-index: 1; }

.brand-text { display: flex; flex-direction: column; }
.brand-name {
  font-size: 15px; font-weight: 800; color: var(--text);
  letter-spacing: 0.5px;
}
.brand-sub {
  font-size: 10px; color: var(--text2);
  margin-top: 0;
  letter-spacing: 0.3px;
}

/* ===== 导航菜单（桌面） ===== */
.desktop-nav {
  display: flex; align-items: center; gap: 1px;
  flex: 1; justify-content: center;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; scrollbar-width: none;
  padding: 0 8px;
}
.desktop-nav::-webkit-scrollbar { display: none; }

.nav-item {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: var(--radius-md);
  font-size: 13px; color: var(--text2);
  text-decoration: none; white-space: nowrap;
  transition: all 0.25s ease; flex-shrink: 0;
  position: relative;
}
.nav-item:hover {
  color: var(--text);
  background: rgba(255,255,255,0.04);
}
.nav-item.active {
  color: var(--accent);
  background: rgba(74,222,128,0.08);
}
.nav-indicator {
  position: absolute;
  bottom: 0; left: 50%; transform: translateX(-50%);
  width: 0; height: 2px;
  background: var(--accent);
  border-radius: 1px;
  transition: width 0.3s ease;
}
.nav-item.active .nav-indicator { width: 20px; }
.nav-icon { font-size: 15px; }
.nav-text { font-size: 13px; font-weight: 500; }

/* ===== 模式切换按钮（太空船风格） ===== */
.mode-btn {
  position: relative;
  display: flex; align-items: center;
  padding: 0; border-radius: var(--radius-full);
  border: none;
  cursor: pointer; flex-shrink: 0;
  background: transparent;
  overflow: hidden;
  transition: transform 0.3s var(--ease-spring);
}
.mode-btn:hover { transform: scale(1.05); }
.mode-btn:active { transform: scale(0.95); }

.mode-btn-inner {
  position: relative;
  display: flex; align-items: center; gap: 8px;
  padding: 8px 18px 8px 10px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, rgba(74,222,128,0.12), rgba(74,222,128,0.04));
  border: 1px solid rgba(74,222,128,0.2);
  z-index: 1;
  transition: all 0.3s ease;
}
.mode-btn.study .mode-btn-inner {
  background: linear-gradient(135deg, rgba(129,140,248,0.12), rgba(129,140,248,0.04));
  border-color: rgba(129,140,248,0.2);
}

.mode-icon-wrap {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
  background: rgba(74,222,128,0.15);
  transition: all 0.3s ease;
}
.mode-btn:hover .mode-icon-wrap { transform: rotate(-15deg); }
.mode-btn.study .mode-icon-wrap { background: rgba(129,140,248,0.15); }
.mode-btn.study:hover .mode-icon-wrap { transform: rotate(15deg); }

.mode-text {
  font-size: 12px; font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.3px;
  transition: color 0.3s;
}
.mode-btn.study .mode-text { color: var(--accent2); }

.mode-glow {
  position: absolute; inset: -4px;
  border-radius: inherit;
  background: radial-gradient(circle at 50% 50%, rgba(74,222,128,0.15), transparent 70%);
  opacity: 0;
  transition: opacity 0.4s;
}
.mode-btn:hover .mode-glow { opacity: 1; }
.mode-btn.study .mode-glow { background: radial-gradient(circle at 50% 50%, rgba(129,140,248,0.15), transparent 70%); }

/* ===== 移动端底部 Dock ===== */
.mobile-dock {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 100;
  background: rgba(7,6,15,0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255,255,255,0.04);
  padding: 6px 8px calc(6px + env(safe-area-inset-bottom));
  justify-content: space-around;
}

.dock-item {
  display: flex; flex-direction: column;
  align-items: center; gap: 2px;
  padding: 6px 10px;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.25s ease;
  min-width: 48px;
}
.dock-item.active {
  background: rgba(74,222,128,0.1);
}
.study-mode .dock-item.active {
  background: rgba(129,140,248,0.1);
}
.dock-icon { font-size: 18px; }
.dock-label { font-size: 10px; color: var(--text2); font-weight: 500; }
.dock-item.active .dock-label { color: var(--accent); }
.study-mode .dock-item.active .dock-label { color: var(--accent2); }

@keyframes pulse-glow {
  0%,100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .desktop-nav { display: none; }
  .mobile-dock { display: flex; }
  .nav-inner { padding: 0 12px; height: 56px; }
  .brand-sub { display: none; }
  .mode-text { display: none; }
  .mode-btn-inner { padding: 6px; }
}
</style>
