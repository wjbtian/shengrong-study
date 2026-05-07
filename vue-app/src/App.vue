<template>
  <div class="app-container">

    <TopNav />
    <main class="main-content">
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
</script>

<style>
.app-container {
  min-height: 100vh;
  position: relative;
  background: #080810;
}

/* 渐变遮罩 */
.app-container::before {
  content: '';
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at 30% 50%, rgba(74, 222, 128, 0.08) 0%, transparent 60%),
              radial-gradient(ellipse at 70% 30%, rgba(129, 140, 248, 0.06) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 80%, rgba(74, 222, 128, 0.05) 0%, transparent 50%);
  z-index: 1;
  pointer-events: none;
}

.main-content {
  padding: 88px 16px 40px;
  position: relative;
  z-index: 2;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  height: 100vh;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .main-content {
    padding: 88px 12px 16px;
  }
}
</style>
