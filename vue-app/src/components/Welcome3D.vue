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
let pointsMain, pointsGlow
let animFrame = null
let startTime = null
const ANIMATION_DURATION = 8000

const PARTICLE_COUNT = 12000
const posMain = new Float32Array(PARTICLE_COUNT * 3)
const posGlow = new Float32Array(PARTICLE_COUNT * 3)
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

  // ===== 相机 =====
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 9)

  // ===== 渲染器（HDR关键）=====
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  container.appendChild(renderer.domElement)

  // ===== 后期处理 =====
  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    2.2,  // 强度
    0.4,  // 半径
    0.85  // 阈值
  )
  composer.addPass(bloomPass)

  // ===== 初始化粒子 =====
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    posMain[i * 3] = posGlow[i * 3] = 0
    posMain[i * 3 + 1] = posGlow[i * 3 + 1] = 0
    posMain[i * 3 + 2] = posGlow[i * 3 + 2] = 0

    velocity[i * 3] = (Math.random() - 0.5) * 6
    velocity[i * 3 + 1] = (Math.random() - 0.5) * 6
    velocity[i * 3 + 2] = (Math.random() - 0.5) * 2
  }

  // ===== 实体粒子（金色）=====
  const geoMain = new THREE.BufferGeometry()
  geoMain.setAttribute('position', new THREE.BufferAttribute(posMain, 3))

  const matMain = new THREE.PointsMaterial({
    size: 0.045,
    color: 0xffcc00,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  })

  pointsMain = new THREE.Points(geoMain, matMain)
  scene.add(pointsMain)

  // ===== 发光轮廓粒子（淡黄色）=====
  const geoGlow = new THREE.BufferGeometry()
  geoGlow.setAttribute('position', new THREE.BufferAttribute(posGlow, 3))

  const matGlow = new THREE.PointsMaterial({
    size: 0.09,
    color: 0xffffaa,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  })

  pointsGlow = new THREE.Points(geoGlow, matGlow)
  scene.add(pointsGlow)

  // ===== 地面（反射感）=====
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.2,
      metalness: 0.8
    })
  )
  plane.rotation.x = -Math.PI / 2
  plane.position.y = -3
  scene.add(plane)

  // ===== 灯光 =====
  const light = new THREE.PointLight(0xffffff, 2)
  light.position.set(0, 5, 5)
  scene.add(light)

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

    canvas.width = 300
    canvas.height = 500

    ctx.drawImage(img, 0, 0, 300, 500)

    const data = ctx.getImageData(0, 0, 300, 500).data

    let i3 = 0
    for (let y = 0; y < 500; y += 2) {
      for (let x = 0; x < 300; x += 2) {
        const i = (y * 300 + x) * 4
        const bright = data[i] + data[i + 1] + data[i + 2]

        if (bright > 200 && i3 < PARTICLE_COUNT) {
          target[i3 * 3] = (x - 150) / 35
          target[i3 * 3 + 1] = (250 - y) / 35
          target[i3 * 3 + 2] = (Math.random() - 0.5) * 2
          i3++
        }
      }
    }

    // 填充剩余粒子
    while (i3 < PARTICLE_COUNT) {
      target[i3 * 3] = (Math.random() - 0.5) * 15
      target[i3 * 3 + 1] = (Math.random() - 0.5) * 20
      target[i3 * 3 + 2] = (Math.random() - 0.5) * 5
      i3++
    }

    // 开始动画
    startTime = Date.now()
    animate()

    // 2.5秒后显示文字
    setTimeout(() => {
      showText.value = true
    }, 2500)
  }
  img.onerror = () => {
    // 图片加载失败，使用随机分布
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      target[i * 3] = (Math.random() - 0.5) * 15
      target[i * 3 + 1] = (Math.random() - 0.5) * 20
      target[i * 3 + 2] = (Math.random() - 0.5) * 5
    }
    startTime = Date.now()
    animate()
    setTimeout(() => {
      showText.value = true
    }, 2500)
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

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3

    if (time < 0.6) {
      // 爆发阶段
      pMain[i3] += velocity[i3] * 0.35
      pMain[i3 + 1] += velocity[i3 + 1] * 0.35
      pMain[i3 + 2] += velocity[i3 + 2] * 0.35

      pGlow[i3] += velocity[i3] * 0.45
      pGlow[i3 + 1] += velocity[i3 + 1] * 0.45
      pGlow[i3 + 2] += velocity[i3 + 2] * 0.45
    } else if (time < 2) {
      // 聚合阶段
      pMain[i3] += (target[i3] - pMain[i3]) * 0.12
      pMain[i3 + 1] += (target[i3 + 1] - pMain[i3 + 1]) * 0.12
      pMain[i3 + 2] += (target[i3 + 2] - pMain[i3 + 2]) * 0.12

      pGlow[i3] += (target[i3] - pGlow[i3]) * 0.08
      pGlow[i3 + 1] += (target[i3 + 1] - pGlow[i3 + 1]) * 0.08
      pGlow[i3 + 2] += (target[i3 + 2] - pGlow[i3 + 2]) * 0.08
    } else {
      // 稳定阶段 - 轻微呼吸
      const breathe = Math.sin(time * 2 + i * 0.01) * 0.02
      pMain[i3] += (target[i3] - pMain[i3]) * 0.05 + breathe
      pMain[i3 + 1] += (target[i3 + 1] - pMain[i3 + 1]) * 0.05 + breathe
      pMain[i3 + 2] += (target[i3 + 2] - pMain[i3 + 2]) * 0.05

      pGlow[i3] += (target[i3] - pGlow[i3]) * 0.03
      pGlow[i3 + 1] += (target[i3 + 1] - pGlow[i3 + 1]) * 0.03
      pGlow[i3 + 2] += (target[i3 + 2] - pGlow[i3 + 2]) * 0.03
    }
  }

  pointsMain.geometry.attributes.position.needsUpdate = true
  pointsGlow.geometry.attributes.position.needsUpdate = true

  // 🎥 镜头推进
  if (time > 1.5 && time < 3) {
    camera.position.z -= 0.025
  }

  // Bloom爆发
  if (time > 2) {
    bloomPass.strength = 3
  }

  // 使用composer渲染（带辉光）
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
  animation: textFadeIn 1s ease forwards;
}

.welcome-text h1 {
  font-size: 50px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 30px gold, 0 0 60px rgba(255, 215, 0, 0.5);
  margin: 0 0 16px 0;
}

.welcome-text p {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

@keyframes textFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -40%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
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
