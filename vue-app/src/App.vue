<template>
  <div class="app-container">
    <!-- 太空粒子背景 -->
    <div class="stars-bg" ref="starsRef"></div>
    <div class="orbit-ring ring-1"></div>
    <div class="orbit-ring ring-2"></div>
    <div class="orbit-ring ring-3"></div>

    <TopNav />
    <main class="main-content" ref="mainRef">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TopNav from './components/TopNav.vue'

// 生成漂浮星星
const starsRef = ref(null)
onMounted(() => {
  if (!starsRef.value) return
  const container = starsRef.value
  for (let i = 0; i < 50; i++) {
    const star = document.createElement('div')
    star.className = 'star-particle'
    const size = 2 + Math.random() * 3
    star.style.cssText = `
      width:${size}px;height:${size}px;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      animation-delay:${Math.random() * 8}s;
      animation-duration:${4 + Math.random() * 6}s;
      opacity:${0.2 + Math.random() * 0.5};
    `
    container.appendChild(star)
  }
})
</script>

<style>
@keyframes drift {
  0%,100% { transform: translate(0, 0); }
  25% { transform: translate(20px, -15px); }
  50% { transform: translate(-10px, -25px); }
  75% { transform: translate(-20px, 10px); }
}
@keyframes ring-spin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.app-container {
  min-height: 100vh;
  position: relative;
  background: #07060f;
  overflow: hidden;
}

/* 太空粒子 */
.stars-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.star-particle {
  position: absolute;
  border-radius: 50%;
  background: white;
  animation: drift 6s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(255,255,255,0.3);
}

/* 轨道环装饰 */
.orbit-ring {
  position: fixed;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.03);
  pointer-events: none;
  z-index: 0;
  animation: ring-spin 40s linear infinite;
}
.ring-1 { width: 600px; height: 600px; top: 30%; left: 50%; border-color: rgba(74,222,128,0.04); }
.ring-2 { width: 400px; height: 400px; top: 30%; left: 50%; animation-direction: reverse; animation-duration: 30s; border-color: rgba(129,140,248,0.04); }
.ring-3 { width: 800px; height: 800px; top: 30%; left: 50%; animation-duration: 55s; border-color: rgba(244,114,182,0.03); }

.main-content {
  padding: 80px 20px 40px;
  position: relative;
  z-index: 2;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  height: 100vh;
  scroll-behavior: smooth;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.98);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.98);
}

/* 响应式 */
@media (max-width: 768px) {
  .main-content {
    padding: 76px 12px 80px;
  }
  .orbit-ring { display: none; }
}
</style>
