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
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const props = defineProps({
  showWelcome: Boolean
})

const emit = defineEmits(['skip'])

const canvasContainer = ref(null)
const showText = ref(false)
let scene, camera, renderer, composer, bloomPass
let pointsMain, pointsGlow, pointsSparkle
let animFrame = null
let startTime = null
const ANIMATION_DURATION = 10000 // 10秒总动画

const PARTICLE_COUNT = 8000
const posMain = new Float32Array(PARTICLE_COUNT * 3)
const posGlow = new Float32Array(PARTICLE_COUNT * 3)
const posSparkle = new Float32Array(PARTICLE_COUNT * 3)
const target = new Float32Array(PARTICLE_COUNT * 3)
const velocity = new Float32Array(PARTICLE_COUNT * 3)

function skipWelcome() {
  emit('skip')
}

function init() {
  const container = canvasContainer.value
  if (!container) return

  // ===== 场景 =====
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x000000, 0.03)

  // ===== 相机 =====
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 12)

  // ===== 渲染器（HDR关键）=====
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.5
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.appendChild(renderer.domElement)

  // ===== 后期处理 =====
  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,  // 强度 - 降低让效果更自然
    0.5,  // 半径
    0.5   // 阈值 - 降低让更多粒子发光
  )
  composer.addPass(bloomPass)

  // ===== 初始化粒子 =====
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    posMain[i * 3] = posGlow[i * 3] = posSparkle[i * 3] = 0
    posMain[i * 3 + 1] = posGlow[i * 3 + 1] = posSparkle[i * 3 + 1] = 0
    posMain[i * 3 + 2] = posGlow[i * 3 + 2] = posSparkle[i * 3 + 2] = 0

    velocity[i * 3] = (Math.random() - 0.5) * 8
    velocity[i * 3 + 1] = (Math.random() - 0.5) * 8
    velocity[i * 3 + 2] = (Math.random() - 0.5) * 4
  }

  // ===== 主粒子层（亮金色）=====
  const geoMain = new THREE.BufferGeometry()
  geoMain.setAttribute('position', new THREE.BufferAttribute(posMain, 3))

  const matMain = new THREE.PointsMaterial({
    size: 0.08,
    color: 0xffd700,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    sizeAttenuation: true
  })

  pointsMain = new THREE.Points(geoMain, matMain)
  scene.add(pointsMain)

  // ===== 发光层（淡黄色，更大）=====
  const geoGlow = new THREE.BufferGeometry()
  geoGlow.setAttribute('position', new THREE.BufferAttribute(posGlow, 3))

  const matGlow = new THREE.PointsMaterial({
    size: 0.18,
    color: 0xffaa00,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    sizeAttenuation: true
  })

  pointsGlow = new THREE.Points(geoGlow, matGlow)
  scene.add(pointsGlow)

  // ===== 闪光层（白色，最小最亮）=====
  const geoSparkle = new THREE.BufferGeometry()
  geoSparkle.setAttribute('position', new THREE.BufferAttribute(posSparkle, 3))

  const matSparkle = new THREE.PointsMaterial({
    size: 0.04,
    color: 0xffffff,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    sizeAttenuation: true
  })

  pointsSparkle = new THREE.Points(geoSparkle, matSparkle)
  scene.add(pointsSparkle)

  // ===== 地面反射 =====
  const planeGeo = new THREE.PlaneGeometry(50, 50)
  const planeMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    roughness: 0.1,
    metalness: 0.95,
    envMapIntensity: 1
  })
  const plane = new THREE.Mesh(planeGeo, planeMat)
  plane.rotation.x = -Math.PI / 2
  plane.position.y = -4
  scene.add(plane)

  // ===== 多光源系统 =====
  const ambientLight = new THREE.AmbientLight(0x222222, 0.5)
  scene.add(ambientLight)

  const mainLight = new THREE.PointLight(0xffd700, 3, 50)
  mainLight.position.set(0, 8, 8)
  scene.add(mainLight)

  const rimLight = new THREE.PointLight(0x00aaff, 2, 50)
  rimLight.position.set(-8, 4, -5)
  scene.add(rimLight)

  const fillLight = new THREE.PointLight(0xff6600, 1.5, 50)
  fillLight.position.set(8, 2, 5)
  scene.add(fillLight)

  // ===== 加载机甲图 =====
  loadMechaImage()

  window.addEventListener('resize', onResize)
}

function loadMechaImage() {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // 提高分辨率
    canvas.width = 400
    canvas.height = 600

    ctx.drawImage(img, 0, 0, 400, 600)

    const data = ctx.getImageData(0, 0, 400, 600).data

    let i3 = 0
    const step = 2 // 采样步长
    
    for (let y = 0; y < 600; y += step) {
      for (let x = 0; x < 400; x += step) {
        const i = (y * 400 + x) * 4
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const bright = (r + g + b) / 3

        // 降低亮度阈值，让更多粒子显示
        if (bright > 80 && i3 < PARTICLE_COUNT) {
          target[i3 * 3] = (x - 200) / 40
          target[i3 * 3 + 1] = (300 - y) / 40
          target[i3 * 3 + 2] = (bright / 255) * 3 - 1.5 // 根据亮度设置深度
          i3++
        }
      }
    }

    // 填充剩余粒子为随机分布
    while (i3 < PARTICLE_COUNT) {
      target[i3 * 3] = (Math.random() - 0.5) * 20
      target[i3 * 3 + 1] = (Math.random() - 0.5) * 25
      target[i3 * 3 + 2] = (Math.random() - 0.5) * 8
      i3++
    }

    // 开始动画
    startTime = Date.now()
    animate()

    // 3秒后显示文字
    setTimeout(() => {
      showText.value = true
    }, 3000)
  }
  img.onerror = () => {
    // 图片加载失败，使用螺旋分布
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 20
      const radius = (i / PARTICLE_COUNT) * 10
      target[i * 3] = Math.cos(angle) * radius
      target[i * 3 + 1] = (i / PARTICLE_COUNT) * 20 - 10
      target[i * 3 + 2] = Math.sin(angle) * radius * 0.5
    }
    startTime = Date.now()
    animate()
    setTimeout(() => {
      showText.value = true
    }, 3000)
  }
  img.src = '/mecha.jpg'
}

function animate() {
  if (!startTime) return

  const elapsed = Date.now() - startTime
  const time = elapsed / 1000
  const progress = Math.min(elapsed / ANIMATION_DURATION, 1)

  const pMain = pointsMain.geometry.attributes.position.array
  const pGlow = pointsGlow.geometry.attributes.position.array
  const pSparkle = pointsSparkle.geometry.attributes.position.array

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3

    if (time < 1) {
      // 阶段1：爆发 - 粒子向四周飞散
      const explosionForce = 1 - time // 随时间减弱
      pMain[i3] += velocity[i3] * 0.4 * explosionForce
      pMain[i3 + 1] += velocity[i3 + 1] * 0.4 * explosionForce
      pMain[i3 + 2] += velocity[i3 + 2] * 0.4 * explosionForce

      pGlow[i3] += velocity[i3] * 0.5 * explosionForce
      pGlow[i3 + 1] += velocity[i3 + 1] * 0.5 * explosionForce
      pGlow[i3 + 2] += velocity[i3 + 2] * 0.5 * explosionForce

      pSparkle[i3] += velocity[i3] * 0.6 * explosionForce
      pSparkle[i3 + 1] += velocity[i3 + 1] * 0.6 * explosionForce
      pSparkle[i3 + 2] += velocity[i3 + 2] * 0.6 * explosionForce
    } else if (time < 3) {
      // 阶段2：聚合 - 粒子向目标位置聚集
      const t = (time - 1) / 2 // 0-1
      const ease = t * t * (3 - 2 * t) // smoothstep
      const lerpFactor = 0.08 + ease * 0.12

      pMain[i3] += (target[i3] - pMain[i3]) * lerpFactor
      pMain[i3 + 1] += (target[i3 + 1] - pMain[i3 + 1]) * lerpFactor
      pMain[i3 + 2] += (target[i3 + 2] - pMain[i3 + 2]) * lerpFactor

      pGlow[i3] += (target[i3] - pGlow[i3]) * (lerpFactor * 0.7)
      pGlow[i3 + 1] += (target[i3 + 1] - pGlow[i3 + 1]) * (lerpFactor * 0.7)
      pGlow[i3 + 2] += (target[i3 + 2] - pGlow[i3 + 2]) * (lerpFactor * 0.7)

      pSparkle[i3] += (target[i3] - pSparkle[i3]) * (lerpFactor * 0.5)
      pSparkle[i3 + 1] += (target[i3 + 1] - pSparkle[i3 + 1]) * (lerpFactor * 0.5)
      pSparkle[i3 + 2] += (target[i3 + 2] - pSparkle[i3 + 2]) * (lerpFactor * 0.5)
    } else {
      // 阶段3：稳定 - 轻微浮动+呼吸效果
      const breathe = Math.sin(time * 3 + i * 0.05) * 0.03
      const drift = Math.sin(time * 1.5 + i * 0.1) * 0.02

      pMain[i3] += (target[i3] - pMain[i3]) * 0.05 + breathe
      pMain[i3 + 1] += (target[i3 + 1] - pMain[i3 + 1]) * 0.05 + drift
      pMain[i3 + 2] += (target[i3 + 2] - pMain[i3 + 2]) * 0.05

      pGlow[i3] += (target[i3] - pGlow[i3]) * 0.03 + breathe * 1.5
      pGlow[i3 + 1] += (target[i3 + 1] - pGlow[i3 + 1]) * 0.03 + drift * 1.5
      pGlow[i3 + 2] += (target[i3 + 2] - pGlow[i3 + 2]) * 0.03

      pSparkle[i3] += (target[i3] - pSparkle[i3]) * 0.02
      pSparkle[i3 + 1] += (target[i3 + 1] - pSparkle[i3 + 1]) * 0.02
      pSparkle[i3 + 2] += (target[i3 + 2] - pSparkle[i3 + 2]) * 0.02
    }
  }

  pointsMain.geometry.attributes.position.needsUpdate = true
  pointsGlow.geometry.attributes.position.needsUpdate = true
  pointsSparkle.geometry.attributes.position.needsUpdate = true

  // 🎥 镜头动画
  if (time > 2 && time < 5) {
    // 缓慢推进
    camera.position.z = 12 - (time - 2) * 0.8
  }

  // Bloom动态调整
  if (time > 1 && time < 3) {
    // 聚合时增强
    bloomPass.strength = 1.5 + (time - 1) * 0.5
  } else if (time >= 3) {
    // 稳定后保持
    bloomPass.strength = 2.5 + Math.sin(time * 2) * 0.3
  }

  // 粒子大小呼吸
  const breatheScale = 1 + Math.sin(time * 4) * 0.1
  pointsMain.material.size = 0.08 * breatheScale
  pointsGlow.material.size = 0.18 * breatheScale

  // 整体缓慢旋转
  if (time > 3) {
    const rotSpeed = 0.001
    pointsMain.rotation.y += rotSpeed
    pointsGlow.rotation.y += rotSpeed
    pointsSparkle.rotation.y += rotSpeed
  }

  // 使用composer渲染
  composer.render()

  if (progress < 1) {
    animFrame = requestAnimationFrame(animate)
  } else {
    emit('skip')
  }
}

function onResize() {
  if (!camera || !renderer || !composer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
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
  background: #000;
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
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  z-index: 10;
  animation: textFadeIn 1.5s ease forwards;
}

.welcome-text h1 {
  font-size: 56px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 
    0 0 20px rgba(255, 215, 0, 0.8),
    0 0 40px rgba(255, 215, 0, 0.5),
    0 0 80px rgba(255, 215, 0, 0.3);
  margin: 0 0 20px 0;
  letter-spacing: 8px;
}

.welcome-text p {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  letter-spacing: 4px;
}

@keyframes textFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -40%);
    filter: blur(10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
    filter: blur(0);
  }
}

.welcome-skip {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  animation: skipPulse 2s ease infinite;
  pointer-events: none;
  letter-spacing: 2px;
}

@keyframes skipPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}
</style>
