<template>
  <div v-if="showWelcome" class="welcome-3d-overlay" @click="skipWelcome">
    <div ref="canvasContainer" class="canvas-container"></div>
    <div v-if="showText" class="welcome-text">
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
const showText = ref(true)
let scene, camera, renderer
let points, trails
let animFrame = null
let startTime = null
const ANIMATION_DURATION = 8000 // 8秒总动画

const PARTICLE_COUNT = 5000
const positions = new Float32Array(PARTICLE_COUNT * 3)
const textTargets = new Float32Array(PARTICLE_COUNT * 3)
const imageTargets = new Float32Array(PARTICLE_COUNT * 3)
const velocities = new Float32Array(PARTICLE_COUNT * 3)
let currentTargets = textTargets // 当前目标

function skipWelcome() {
  emit('skip')
}

// 从文字生成粒子目标位置
function setTextTargets() {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = 600
  canvas.height = 200

  // 绘制文字
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 60px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('欢迎 永远的神', canvas.width / 2, canvas.height / 2 - 20)
  ctx.font = '30px sans-serif'
  ctx.fillText('开启今天的学习之旅', canvas.width / 2, canvas.height / 2 + 40)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data

  // 收集文字像素
  const textPixels = []
  const step = 2
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const i = (y * canvas.width + x) * 4
      if (imageData[i + 3] > 128) {
        textPixels.push({
          x: (x - canvas.width / 2) / 30,
          y: -(y - canvas.height / 2) / 30,
          z: (Math.random() - 0.5) * 2
        })
      }
    }
  }

  // 分配目标位置
  let pixelIdx = 0
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    if (pixelIdx < textPixels.length) {
      textTargets[i * 3] = textPixels[pixelIdx].x
      textTargets[i * 3 + 1] = textPixels[pixelIdx].y
      textTargets[i * 3 + 2] = textPixels[pixelIdx].z
      pixelIdx++
    } else {
      textTargets[i * 3] = (Math.random() - 0.5) * 30
      textTargets[i * 3 + 1] = (Math.random() - 0.5) * 10
      textTargets[i * 3 + 2] = (Math.random() - 0.5) * 5
    }
  }
}

// 从图片生成粒子目标位置
function setImageTargets() {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const maxSize = 350
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

      // 收集图片像素
      const imagePixels = []
      const step = 2
      
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
      const threshold = avgBrightness * 0.6

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const i = (y * w + x) * 4
          const brightness = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3
          const contrast = (brightness - avgBrightness) * 1.5 + avgBrightness

          if (contrast > threshold && imageData[i + 3] > 128) {
            imagePixels.push({
              x: (x - w / 2) / 18,
              y: -(y - h / 2) / 18,
              z: (Math.random() - 0.5) * 3
            })
          }
        }
      }

      // 分配目标位置
      let pixelIdx = 0
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        if (pixelIdx < imagePixels.length) {
          imageTargets[i * 3] = imagePixels[pixelIdx].x
          imageTargets[i * 3 + 1] = imagePixels[pixelIdx].y
          imageTargets[i * 3 + 2] = imagePixels[pixelIdx].z
          pixelIdx++
        } else {
          imageTargets[i * 3] = (Math.random() - 0.5) * 25
          imageTargets[i * 3 + 1] = (Math.random() - 0.5) * 15
          imageTargets[i * 3 + 2] = (Math.random() - 0.5) * 5
        }
      }

      resolve()
    }
    img.onerror = () => {
      // 如果图片加载失败，使用随机分布
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        imageTargets[i * 3] = (Math.random() - 0.5) * 20
        imageTargets[i * 3 + 1] = (Math.random() - 0.5) * 10
        imageTargets[i * 3 + 2] = (Math.random() - 0.5) * 5
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
    positions[i * 3] = 0
    positions[i * 3 + 1] = 0
    positions[i * 3 + 2] = 0

    velocities[i * 3] = (Math.random() - 0.5) * 3
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 3
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 3
  }

  // 设置文字目标
  setTextTargets()
  currentTargets = textTargets

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

  // 先加载图片目标
  setImageTargets().then(() => {
    // 开始动画
    startTime = Date.now()
    animate()
  })

  window.addEventListener('resize', onResize)
}

function animate() {
  if (!startTime) return

  const elapsed = Date.now() - startTime
  const time = elapsed / 1000
  const progress = Math.min(elapsed / ANIMATION_DURATION, 1)

  const pos = points.geometry.attributes.position.array
  const trailPos = trails.geometry.attributes.position.array

  // 时间轴：
  // 0-1秒：爆发
  // 1-3秒：聚合到文字
  // 3-4秒：文字停留
  // 4-6秒：切换到机甲
  // 6-8秒：机甲停留+淡出

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3

    // 保存旧位置到拖尾
    trailPos[i3] = pos[i3]
    trailPos[i3 + 1] = pos[i3 + 1]
    trailPos[i3 + 2] = pos[i3 + 2]

    if (time < 1) {
      // 阶段1：爆发
      pos[i3] += velocities[i3] * 0.15
      pos[i3 + 1] += velocities[i3 + 1] * 0.15
      pos[i3 + 2] += velocities[i3 + 2] * 0.15
    } else if (time < 3) {
      // 阶段2：聚合到文字
      const ease = 0.08
      pos[i3] += (textTargets[i3] - pos[i3]) * ease
      pos[i3 + 1] += (textTargets[i3 + 1] - pos[i3 + 1]) * ease
      pos[i3 + 2] += (textTargets[i3 + 2] - pos[i3 + 2]) * ease
    } else if (time < 4) {
      // 阶段3：文字停留，轻微浮动
      pos[i3] += (Math.random() - 0.5) * 0.01
      pos[i3 + 1] += (Math.random() - 0.5) * 0.01
      pos[i3 + 2] += (Math.random() - 0.5) * 0.005
      
      // 保持靠近目标
      pos[i3] += (textTargets[i3] - pos[i3]) * 0.03
      pos[i3 + 1] += (textTargets[i3 + 1] - pos[i3 + 1]) * 0.03
    } else if (time < 6) {
      // 阶段4：切换到机甲
      if (currentTargets !== imageTargets) {
        currentTargets = imageTargets
        // 隐藏文字
        showText.value = false
      }
      const ease = 0.06
      pos[i3] += (imageTargets[i3] - pos[i3]) * ease
      pos[i3 + 1] += (imageTargets[i3 + 1] - pos[i3 + 1]) * ease
      pos[i3 + 2] += (imageTargets[i3 + 2] - pos[i3 + 2]) * ease
    } else {
      // 阶段5：机甲停留+呼吸
      pos[i3] += (Math.random() - 0.5) * 0.02
      pos[i3 + 1] += (Math.random() - 0.5) * 0.02
      pos[i3 + 2] += (Math.random() - 0.5) * 0.01
      
      pos[i3] += (imageTargets[i3] - pos[i3]) * 0.05
      pos[i3 + 1] += (imageTargets[i3 + 1] - pos[i3 + 1]) * 0.05
    }
  }

  points.geometry.attributes.position.needsUpdate = true
  trails.geometry.attributes.position.needsUpdate = true

  // 呼吸光效果
  if (points.material) {
    points.material.size = 0.06 + Math.sin(time * 6) * 0.02
  }

  // 整体旋转
  if (time > 3 && time < 4) {
    // 文字旋转
    points.rotation.y = Math.sin((time - 3) * Math.PI) * 0.2
    trails.rotation.y = Math.sin((time - 3) * Math.PI) * 0.2
  } else if (time > 6) {
    // 机甲旋转
    points.rotation.y = Math.sin((time - 6) * 0.3) * 0.1
    trails.rotation.y = Math.sin((time - 6) * 0.3) * 0.1
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
  transition: opacity 0.5s ease;
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
