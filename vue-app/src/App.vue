<template>
  <div class="app-container">
    <!-- 科技感背景 -->
    <canvas ref="bgCanvas" class="tech-bg"></canvas>
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
import { ref, onMounted, onUnmounted } from 'vue'
import TopNav from './components/TopNav.vue'

const bgCanvas = ref(null)
let animFrame = null

onMounted(() => {
  const canvas = bgCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  let particles = []

  function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  function createParticles() {
    particles = []
    const count = Math.min(80, Math.floor(window.innerWidth / 20))
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      })
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.forEach(p => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(74, 222, 128, ${p.opacity})`
      ctx.fill()

      p.x += p.vx
      p.y += p.vy

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1
    })

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 150) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(74, 222, 128, ${0.15 * (1 - dist / 150)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }

    animFrame = requestAnimationFrame(draw)
  }

  resize()
  createParticles()
  draw()

  window.addEventListener('resize', () => {
    resize()
    createParticles()
  })
})

onUnmounted(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
})
</script>

<style>
.app-container {
  min-height: 100vh;
  position: relative;
  background: #080810;
}

/* 科技感背景画布 */
.tech-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.7;
}

/* 渐变遮罩 */
.app-container::before {
  content: '';
  position: fixed;
  top: 56px;
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
  padding: 72px 16px 40px;
  position: relative;
  z-index: 2;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
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
    padding: 80px 12px 16px;
  }
}
</style>
