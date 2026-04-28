<template>
  <div v-if="showWelcome" class="welcome-3d-overlay" @click="skipWelcome">
    <div ref="canvasContainer" class="canvas-container"></div>
    <div class="welcome-text">
      <h1>欢迎 永远的神</h1>
      <p>开启今天的学习之旅</p>
    </div>
    <div class="welcome-skip">点击跳过</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  showWelcome: Boolean
})

const emit = defineEmits(['skip'])

const canvasContainer = ref(null)
let scene, camera, renderer
let points, trails
let animFrame = null
let startTime = null
const ANIMATION_DURATION = 5000 // 5秒总动画

const PARTICLE_COUNT = 4000
const positions = new Float32Array(PARTICLE_COUNT * 3)
const targets = new Float32Array(PARTICLE_COUNT * 3)
const velocities = new Float32Array(PARTICLE_COUNT * 3)

function skipWelcome() {
  emit('skip')
}

// 从图片生成粒子目标位置
function setImageTargets() {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // 限制图片尺寸，保持比例
      const maxSize = 300
      let w = img.width
      let h = img.height
      if (w > h) {
        if (w > maxSize) { h = h * (maxSize / w); w = maxSize }
      } else {
        if (h > maxSize) { w = w * (maxSize / h); h = maxSize }
      }

      canvas.width = w
      canvas.height = h
      ctx.drawImage(img, 0, 0, w, h)

      const imageData = ctx.getImageData(0, 0, w, h).data

      // 收集图片像素位置（提高对比度和清晰度）
      const imagePixels = []
      const step = 2 // 减小采样步长，提高密度
      
      // 先计算平均亮度用于自适应阈值
      let totalBrightness = 0
      let pixelCount = 0
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const i = (y * w + x) * 4
          const brightness = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3
          totalBrightness += brightness
          pixelCount++
        }
      }
      const avgBrightness = totalBrightness / pixelCount
      const threshold = avgBrightness * 0.7 // 自适应阈值
      
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const i = (y * w + x) * 4
          const r = imageData[i]
          const g = imageData[i + 1]
          const b = imageData[i + 2]
          const a = imageData[i + 3]

          // 计算亮度，使用自适应阈值
          const brightness = (r + g + b) / 3
          
          // 增强对比度：暗部更暗，亮部更亮
          const contrast = (brightness - avgBrightness) * 1.5 + avgBrightness
          
          if (contrast > threshold && a > 128) {
            imagePixels.push({
              x: (x - w / 2) / 20, // 放大图像
              y: -(y - h / 2) / 20,
              z: (Math.random() - 0.5) * 3
            })
          }
        }
      }

      // 分配目标位置
      let pixelIdx = 0
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        if (pixelIdx < imagePixels.length) {
          targets[i * 3] = imagePixels[pixelIdx].x
          targets[i * 3 + 1] = imagePixels[pixelIdx].y
          targets[i * 3 + 2] = imagePixels[pixelIdx].z
          pixelIdx++
        } else {
          // 多余粒子随机分布在图像周围
          targets[i * 3] = (Math.random() - 0.5) * 25
          targets[i * 3 + 1] = (Math.random() - 0.5) * 15
          targets[i * 3 + 2] = (Math.random() - 0.5) * 5
        }
      }

      resolve()
    }
    img.onerror = () => {
      console.error('Failed to load mecha image')
      // 如果图片加载失败，使用随机分布
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        targets[i * 3] = (Math.random() - 0.5) * 20
        targets[i * 3 + 1] = (Math.random() - 0.5) * 10
        targets[i * 3 + 2] = (Math.random() - 0.5) * 5
      }
      resolve()
    }
    img.src = '/mecha.jpg'
  })
}

function init() {
  const container = canvasContainer.value
  if (!container) return

  // 场景
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x0a0a1a, 0.02)

  // 相机
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.z = 8

  // 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x0a0a1a, 1)
  container.appendChild(renderer.domElement)

  // 初始化粒子
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // 初始全部在中心（爆发感）
    positions[i * 3] = 0
    positions[i * 3 + 1] = 0
    positions[i * 3 + 2] = 0

    velocities[i * 3] = (Math.random() - 0.5) * 3
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 3
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 3
  }

  // 主粒子
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const mat = new THREE.PointsMaterial({
    size: 0.08,
    color: 0x4ade80,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending
  })

  points = new THREE.Points(geo, mat)
  scene.add(points)

  // 拖尾粒子
  const trailGeo = new THREE.BufferGeometry()
  const trailPositions = new Float32Array(PARTICLE_COUNT * 3)
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3))

  const trailMat = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x22c55e,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  })

  trails = new THREE.Points(trailGeo, trailMat)
  scene.add(trails)

  // 设置图片目标
  setImageTargets().then(() => {
    // 开始动画
    startTime = Date.now()
    animate()
  })

  // 窗口大小调整
  window.addEventListener('resize', onResize)
}

function animate() {
  if (!startTime) return

  const elapsed = Date.now() - startTime
  const time = elapsed / 1000 // 转换为秒
  const progress = Math.min(elapsed / ANIMATION_DURATION, 1)

  const pos = points.geometry.attributes.position.array
  const trailPos = trails.geometry.attributes.position.array

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3

    // 保存旧位置到拖尾
    trailPos[i3] = pos[i3]
    trailPos[i3 + 1] = pos[i3 + 1]
    trailPos[i3 + 2] = pos[i3 + 2]

    // ===== 阶段1：爆发 (0-0.8秒) =====
    if (time < 0.8) {
      pos[i3] += velocities[i3] * 0.15
      pos[i3 + 1] += velocities[i3 + 1] * 0.15
      pos[i3 + 2] += velocities[i3 + 2] * 0.15
    }
    // ===== 阶段2：聚合 (0.8-2.5秒) =====
    else if (time < 2.5) {
      const ease = 0.1
      pos[i3] += (targets[i3] - pos[i3]) * ease
      pos[i3 + 1] += (targets[i3 + 1] - pos[i3 + 1]) * ease
      pos[i3 + 2] += (targets[i3 + 2] - pos[i3 + 2]) * ease
    }
    // ===== 阶段3：稳定+呼吸 (2.5-5秒) =====
    else {
      // 轻微浮动
      pos[i3] += (Math.random() - 0.5) * 0.02
      pos[i3 + 1] += (Math.random() - 0.5) * 0.02
      pos[i3 + 2] += (Math.random() - 0.5) * 0.01

      // 保持靠近目标
      pos[i3] += (targets[i3] - pos[i3]) * 0.05
      pos[i3 + 1] += (targets[i3 + 1] - pos[i3 + 1]) * 0.05
    }
  }

  points.geometry.attributes.position.needsUpdate = true
  trails.geometry.attributes.position.needsUpdate = true

  // 呼吸光效果
  if (points.material) {
    points.material.size = 0.06 + Math.sin(time * 8) * 0.03
  }

  // 整体旋转
  if (time > 2.5) {
    points.rotation.y = Math.sin((time - 2.5) * 0.3) * 0.1
    trails.rotation.y = Math.sin((time - 2.5) * 0.3) * 0.1
  }

  renderer.render(scene, camera)

  if (progress < 1) {
    animFrame = requestAnimationFrame(animate)
  } else {
    emit('skip')
  }
}

function onResize() {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

onMounted(() => {
  if (props.showWelcome) {
    init()
  }
})

onUnmounted(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
  window.removeEventListener('resize', onResize)
  if (renderer) {
    renderer.dispose()
    if (canvasContainer.value && renderer.domElement) {
      canvasContainer.value.removeChild(renderer.domElement)
    }
  }
})
</script>

<style scoped>
.welcome-3d-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #0a0a1a;
  cursor: pointer;
}

.canvas-container {
  width: 100%;
  height: 100%;
}

.canvas-container canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.welcome-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  z-index: 10;
}

.welcome-text h1 {
  font-size: 48px;
  font-weight: bold;
  color: #4ade80;
  text-shadow: 0 0 20px rgba(74, 222, 128, 0.5), 0 0 40px rgba(74, 222, 128, 0.3);
  margin: 0 0 16px 0;
  animation: textGlow 2s ease-in-out infinite;
}

.welcome-text p {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

@keyframes textGlow {
  0%, 100% { 
    text-shadow: 0 0 20px rgba(74, 222, 128, 0.5), 0 0 40px rgba(74, 222, 128, 0.3);
    opacity: 1;
  }
  50% { 
    text-shadow: 0 0 30px rgba(74, 222, 128, 0.8), 0 0 60px rgba(74, 222, 128, 0.5);
    opacity: 0.9;
  }
}

.welcome-skip {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  animation: skipPulse 2s ease infinite;
  pointer-events: none;
}

@keyframes skipPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}
</style>
