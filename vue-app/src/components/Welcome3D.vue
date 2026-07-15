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
let pointsMesh, trailMesh
let animFrame = null
let startTime = null
const ANIMATION_DURATION = 20000 // 20秒总动画

const PARTICLE_COUNT = 6000
const TRAIL_LENGTH = 8 // 拖尾长度

// 粒子数据
const positions = new Float32Array(PARTICLE_COUNT * 3)
const targets = new Float32Array(PARTICLE_COUNT * 3)
const velocities = new Float32Array(PARTICLE_COUNT * 3)
const colors = new Float32Array(PARTICLE_COUNT * 3)
const sizes = new Float32Array(PARTICLE_COUNT)

// 拖尾数据
const trailPositions = new Float32Array(PARTICLE_COUNT * TRAIL_LENGTH * 3)
const trailColors = new Float32Array(PARTICLE_COUNT * TRAIL_LENGTH * 3)
const trailOpacities = new Float32Array(PARTICLE_COUNT * TRAIL_LENGTH)

function skipWelcome() {
  emit('skip')
}

function init() {
  const container = canvasContainer.value
  if (!container) return

  // ===== 场景 =====
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x050508)

  // ===== 相机 =====
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 15)

  // ===== 渲染器 =====
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 2.0
  container.appendChild(renderer.domElement)

  // ===== 后期处理 - Bloom =====
  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    2.0,  // 强度
    0.8,  // 半径
    0.3   // 阈值
  )
  composer.addPass(bloomPass)

  // ===== 星空背景 =====
  createStarfield()

  // ===== 初始化粒子 =====
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2

    velocities[i * 3] = (Math.random() - 0.5) * 15
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 15
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 10

    // 颜色：金色到橙色的渐变
    const colorVar = Math.random()
    if (colorVar < 0.3) {
      // 亮金色
      colors[i * 3] = 1.0
      colors[i * 3 + 1] = 0.9
      colors[i * 3 + 2] = 0.3
    } else if (colorVar < 0.6) {
      // 橙色
      colors[i * 3] = 1.0
      colors[i * 3 + 1] = 0.6
      colors[i * 3 + 2] = 0.1
    } else if (colorVar < 0.8) {
      // 暖白色
      colors[i * 3] = 1.0
      colors[i * 3 + 1] = 0.95
      colors[i * 3 + 2] = 0.8
    } else {
      // 淡青色点缀
      colors[i * 3] = 0.6
      colors[i * 3 + 1] = 0.9
      colors[i * 3 + 2] = 1.0
    }

    sizes[i] = Math.random() * 0.15 + 0.05
  }

  // ===== 主粒子系统 =====
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  // 自定义ShaderMaterial实现大小和颜色
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() }
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uPixelRatio;
      
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        alpha = pow(alpha, 1.5);
        
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  pointsMesh = new THREE.Points(geometry, material)
  scene.add(pointsMesh)

  // ===== 拖尾系统 =====
  const trailGeo = new THREE.BufferGeometry()
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3))
  trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3))

  const trailMat = new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: { value: renderer.getPixelRatio() }
    },
    vertexShader: `
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uPixelRatio;
      
      void main() {
        vColor = color;
        // 根据顶点索引计算透明度（拖尾末端更透明）
        vAlpha = 1.0 - float(gl_VertexID % ${TRAIL_LENGTH}) / ${TRAIL_LENGTH}.0;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 0.03 * uPixelRatio * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        
        float alpha = (1.0 - smoothstep(0.0, 0.5, dist)) * vAlpha * 0.6;
        
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  trailMesh = new THREE.Points(trailGeo, trailMat)
  scene.add(trailMesh)

  // ===== 地面反射 =====
  const planeGeo = new THREE.PlaneGeometry(100, 100)
  const planeMat = new THREE.MeshStandardMaterial({
    color: 0x080808,
    roughness: 0.05,
    metalness: 1.0
  })
  const plane = new THREE.Mesh(planeGeo, planeMat)
  plane.rotation.x = -Math.PI / 2
  plane.position.y = -6
  scene.add(plane)

  // ===== 网格地面 =====
  const gridHelper = new THREE.GridHelper(50, 50, 0x333333, 0x111111)
  gridHelper.position.y = -5.99
  scene.add(gridHelper)

  // ===== 光源 =====
  const ambientLight = new THREE.AmbientLight(0x222222, 0.3)
  scene.add(ambientLight)

  // 主光源 - 金色
  const mainLight = new THREE.SpotLight(0xffaa00, 10)
  mainLight.position.set(0, 15, 10)
  mainLight.angle = Math.PI / 4
  mainLight.penumbra = 0.5
  scene.add(mainLight)

  // 补光 - 蓝色
  const rimLight = new THREE.PointLight(0x4488ff, 5)
  rimLight.position.set(-10, 5, -5)
  scene.add(rimLight)

  // 底部反光
  const bottomLight = new THREE.PointLight(0xff6600, 3)
  bottomLight.position.set(0, -3, 5)
  scene.add(bottomLight)

  // ===== 加载机甲图 =====
  loadMechaImage()

  window.addEventListener('resize', onResize)
}

function createStarfield() {
  const starCount = 2000
  const starPos = new Float32Array(starCount * 3)
  const starColors = new Float32Array(starCount * 3)

  for (let i = 0; i < starCount; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 100
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 100
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 50 - 20

    const brightness = Math.random() * 0.5 + 0.5
    starColors[i * 3] = brightness
    starColors[i * 3 + 1] = brightness * 0.9
    starColors[i * 3 + 2] = brightness * 0.8
  }

  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3))

  const starMat = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })

  const stars = new THREE.Points(starGeo, starMat)
  scene.add(stars)
}

function loadMechaImage() {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // 获取图片原始尺寸
    const imgW = img.naturalWidth
    const imgH = img.naturalHeight
    
    // 使用原始分辨率，完整显示
    const scale = 1.5 // 放大系数
    const drawW = imgW * scale
    const drawH = imgH * scale
    
    canvas.width = drawW
    canvas.height = drawH

    // 完整绘制原始图片
    ctx.drawImage(img, 0, 0, drawW, drawH)

    const data = ctx.getImageData(0, 0, drawW, drawH).data

    const step = 2 // 减小步长，更多粒子

    // 收集所有候选点
    const candidates = []
    for (let y = 0; y < drawH; y += step) {
      for (let x = 0; x < drawW; x += step) {
        const i = (y * drawW + x) * 4
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const bright = (r + g + b) / 3

        if (bright > 30) { // 降低亮度阈值，捕捉更多细节
          candidates.push({
            x: (x - drawW / 2) / 80, // 减小缩放比例，让图像更大
            y: -(y - drawH / 2) / 80, // 垂直翻转并居中
            z: (bright / 255) * 2 - 1,
            bright: bright
          })
        }
      }
    }

    // 按亮度排序，优先使用重要像素
    candidates.sort((a, b) => b.bright - a.bright)
    
    // 使用前6000个最亮的点，如果不够则随机填充
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (i < candidates.length) {
        const c = candidates[i]
        targets[i * 3] = c.x + (Math.random() - 0.5) * 0.2
        targets[i * 3 + 1] = c.y + (Math.random() - 0.5) * 0.2
        targets[i * 3 + 2] = c.z
      } else {
        // 在机甲周围随机分布，而不是远处
        const angle = Math.random() * Math.PI * 2
        const radius = 3 + Math.random() * 4
        targets[i * 3] = Math.cos(angle) * radius
        targets[i * 3 + 1] = Math.sin(angle) * radius
        targets[i * 3 + 2] = (Math.random() - 0.5) * 2
      }
    }

    // 初始化拖尾
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = 0; j < TRAIL_LENGTH; j++) {
        const idx = (i * TRAIL_LENGTH + j) * 3
        trailPositions[idx] = positions[i * 3]
        trailPositions[idx + 1] = positions[i * 3 + 1]
        trailPositions[idx + 2] = positions[i * 3 + 2]

        trailColors[idx] = colors[i * 3]
        trailColors[idx + 1] = colors[i * 3 + 1]
        trailColors[idx + 2] = colors[i * 3 + 2]
      }
    }

    startTime = Date.now()
    animate()

    setTimeout(() => {
      showText.value = true
    }, 3500)
  }
  img.onerror = () => {
    fallbackAnimation()
  }
  img.src = '/mecha.jpg'
}

function fallbackAnimation() {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 15
    const radius = (i / PARTICLE_COUNT) * 12
    targets[i * 3] = Math.cos(angle) * radius
    targets[i * 3 + 1] = (i / PARTICLE_COUNT) * 18 - 9
    targets[i * 3 + 2] = Math.sin(angle) * radius * 0.5
  }

  startTime = Date.now()
  animate()
  setTimeout(() => {
    showText.value = true
  }, 5000)
}

function updateTrails() {
  // 将历史位置后移
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    for (let j = TRAIL_LENGTH - 1; j > 0; j--) {
      const curr = (i * TRAIL_LENGTH + j) * 3
      const prev = (i * TRAIL_LENGTH + j - 1) * 3
      trailPositions[curr] = trailPositions[prev]
      trailPositions[curr + 1] = trailPositions[prev + 1]
      trailPositions[curr + 2] = trailPositions[prev + 2]
    }
    // 最新位置
    trailPositions[(i * TRAIL_LENGTH) * 3] = positions[i * 3]
    trailPositions[(i * TRAIL_LENGTH) * 3 + 1] = positions[i * 3 + 1]
    trailPositions[(i * TRAIL_LENGTH) * 3 + 2] = positions[i * 3 + 2]
  }

  trailMesh.geometry.attributes.position.needsUpdate = true
}

function animate() {
  if (!startTime) return

  const elapsed = Date.now() - startTime
  const time = elapsed / 1000
  const progress = Math.min(elapsed / ANIMATION_DURATION, 1)

  const pos = pointsMesh.geometry.attributes.position.array

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3

    if (time < 0.8) {
      // 阶段1：爆发（缩短到0.8秒）
      const force = 1 - time / 0.8
      pos[i3] += velocities[i3] * 0.5 * force
      pos[i3 + 1] += velocities[i3 + 1] * 0.5 * force
      pos[i3 + 2] += velocities[i3 + 2] * 0.5 * force
    } else if (time < 4) {
      // 阶段2：聚合到机甲形状（延长到3.2秒）
      const t = (time - 0.8) / 3.2
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const lerp = 0.04 + ease * 0.12

      pos[i3] += (targets[i3] - pos[i3]) * lerp
      pos[i3 + 1] += (targets[i3 + 1] - pos[i3 + 1]) * lerp
      pos[i3 + 2] += (targets[i3 + 2] - pos[i3 + 2]) * lerp
    } else {
      // 阶段3：稳定展示 + 呼吸（延长到16秒）
      const breathe = Math.sin(time * 2 + i * 0.02) * 0.03
      const driftX = Math.sin(time * 0.8 + i * 0.05) * 0.015
      const driftY = Math.cos(time * 1.0 + i * 0.04) * 0.015

      pos[i3] += (targets[i3] - pos[i3]) * 0.02 + breathe + driftX
      pos[i3 + 1] += (targets[i3 + 1] - pos[i3 + 1]) * 0.02 + driftY
      pos[i3 + 2] += (targets[i3 + 2] - pos[i3 + 2]) * 0.02
    }
  }

  pointsMesh.geometry.attributes.position.needsUpdate = true

  // 更新拖尾
  if (Math.floor(time * 60) % 2 === 0) { // 每2帧更新一次
    updateTrails()
  }

  // 镜头动画（延长）
  if (time > 1.5 && time < 6) {
    camera.position.z = 15 - (time - 1.5) * 1.0
    camera.position.y = (time - 1.5) * 0.3
  }

  // Bloom动态（延长）
  if (time > 1 && time < 5) {
    bloomPass.strength = 1.5 + (time - 1) * 0.4
  } else if (time >= 5) {
    bloomPass.strength = 3.1 + Math.sin(time * 2) * 0.4
  }

  // 整体旋转（更慢更柔和）
  if (time > 4) {
    pointsMesh.rotation.y = Math.sin(time * 0.2) * 0.12
    trailMesh.rotation.y = pointsMesh.rotation.y
  }

  // 更新shader时间
  pointsMesh.material.uniforms.uTime.value = time

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
  background: #050508;
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
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  z-index: 10;
  animation: textFadeIn 2s ease forwards;
}

.welcome-text h1 {
  font-size: 64px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 
    0 0 30px rgba(255, 215, 0, 0.9),
    0 0 60px rgba(255, 215, 0, 0.6),
    0 0 120px rgba(255, 215, 0, 0.3);
  margin: 0 0 8px 0;
  letter-spacing: 10px;
}

.welcome-text p {
  font-size: 28px;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  letter-spacing: 6px;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

@keyframes textFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -45%);
    filter: blur(15px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
    filter: blur(0);
  }
}

.welcome-skip {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  animation: skipPulse 2s ease infinite;
  pointer-events: none;
  letter-spacing: 3px;
}

@keyframes skipPulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.7; }
}
</style>
