<template>
  <div class="math-view">
    <!-- 顶部英雄区 -->
    <section class="subject-hero">
      <div class="subject-hero-main">
        <div class="subject-hero-icon">🔢</div>
        <div class="subject-hero-info">
          <h1 class="subject-hero-title">数学学习</h1>
          <p class="subject-hero-subtitle">苏教版四年级下册 · 8个单元 · 思维导图式学习</p>
        </div>
      </div>
      <div class="subject-hero-progress">
        <div class="progress-ring-wrap">
          <svg viewBox="0 0 120 120" class="progress-ring">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
            <circle cx="60" cy="60" r="54" fill="none" stroke="#60a5fa" stroke-width="8"
              :stroke-dasharray="339.292"
              :stroke-dashoffset="339.292 - (339.292 * progressPercent / 100)"
              stroke-linecap="round"/>
          </svg>
          <div class="progress-ring-text">
            <div class="progress-percent">{{ progressPercent }}%</div>
          </div>
        </div>
        <div class="progress-count">{{ doneCount }} / 8 单元</div>
      </div>
    </section>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-value">16</span>
        <span class="stat-label">公式</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">0</span>
        <span class="stat-label">错题</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">0</span>
        <span class="stat-label">练习</span>
      </div>
    </div>

    <!-- 知识网络 -->
    <section class="mindmap-section">
      <div class="section-header">
        <h2 class="section-title">🧠 知识网络</h2>
        <span class="section-subtitle">点击节点展开知识分支</span>
      </div>
      <div class="mindmap-grid">
        <div
          v-for="node in mindmapNodes"
          :key="node.id"
          class="mindmap-node"
          :class="{ expanded: node.expanded }"
          @click="node.expanded = !node.expanded"
        >
          <div class="mindmap-node-header">
            <span class="mindmap-icon">{{ node.icon }}</span>
            <span class="mindmap-title">{{ node.title }}</span>
            <span class="mindmap-toggle">{{ node.expanded ? '−' : '+' }}</span>
          </div>
          <div v-if="node.expanded" class="mindmap-children">
            <div v-for="child in node.children" :key="child" class="mindmap-child">
              {{ child }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 公式卡片 -->
    <section class="formula-section">
      <div class="section-header">
        <h2 class="section-title">📐 重点公式</h2>
        <span class="section-subtitle">本册核心公式与定理</span>
      </div>
      <div class="formula-grid">
        <div v-for="formula in formulas" :key="formula.name" class="formula-card">
          <h4 class="formula-name">{{ formula.name }}</h4>
          <div class="formula-expression">{{ formula.expr }}</div>
          <p class="formula-desc">{{ formula.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 错题本 -->
    <section class="mistake-section">
      <div class="section-header">
        <h2 class="section-title">❌ 错题本</h2>
        <span class="section-subtitle">记录错题，避免再犯</span>
      </div>
      <div class="mistake-empty">
        <div class="mistake-empty-icon">📝</div>
        <p>暂无错题记录</p>
        <span class="mistake-hint">在微信对话中发送错题照片，我会帮你记录</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProgress } from '../utils/api.js'

const progress = ref({})

const mindmapNodes = ref([
  { id: 1, icon: '🔢', title: '计算器', expanded: false, children: ['认识计算器', '用计算器计算', '探索规律'] },
  { id: 2, icon: '📐', title: '平移、旋转和轴对称', expanded: false, children: ['图形的平移', '图形的旋转', '轴对称图形'] },
  { id: 3, icon: '🔢', title: '认识多位数', expanded: false, children: ['亿以内数的认识', '亿以上数的认识', '数的改写与近似'] },
  { id: 4, icon: '📊', title: '三位数乘两位数', expanded: false, children: ['笔算乘法', '常见的数量关系', '积的变化规律'] },
  { id: 5, icon: '📏', title: '用计算器探索规律', expanded: false, children: ['乘法规律', '除法规律', '有趣的算式'] },
  { id: 6, icon: '📐', title: '运算律', expanded: false, children: ['加法交换律和结合律', '乘法交换律和结合律', '乘法分配律', '简便运算'] },
  { id: 7, icon: '🔺', title: '三角形、平行四边形和梯形', expanded: false, children: ['认识三角形', '三角形内角和', '认识平行四边形', '认识梯形'] },
  { id: 8, icon: '📍', title: '确定位置', expanded: false, children: ['用数对确定位置', '在方格纸上确定位置'] },
])

const formulas = ref([
  { name: '加法交换律', expr: 'a + b = b + a', desc: '两个数相加，交换加数的位置，和不变' },
  { name: '加法结合律', expr: '(a + b) + c = a + (b + c)', desc: '三个数相加，先把前两个数相加，或者先把后两个数相加，和不变' },
  { name: '乘法交换律', expr: 'a × b = b × a', desc: '两个数相乘，交换因数的位置，积不变' },
  { name: '乘法结合律', expr: '(a × b) × c = a × (b × c)', desc: '三个数相乘，先把前两个数相乘，或者先把后两个数相乘，积不变' },
  { name: '乘法分配律', expr: '(a + b) × c = a × c + b × c', desc: '两个数的和与一个数相乘，可以先把它们与这个数分别相乘，再相加' },
  { name: '三角形内角和', expr: '∠A + ∠B + ∠C = 180°', desc: '任意三角形的三个内角之和等于180度' },
])

const doneCount = computed(() => {
  const done = progress.value?.doneUnits || []
  return done.filter(u => u.startsWith('math_')).length
})
const progressPercent = computed(() => Math.round((doneCount.value / 8) * 100))

onMounted(async () => {
  try {
    progress.value = await getProgress().catch(() => ({}))
  } catch (e) {
    console.error('加载进度失败:', e)
  }
})
</script>

<style scoped>
.math-view {
  max-width: 1200px;
  margin: 0 auto;
}

/* 英雄区 */
.subject-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.08) 0%, rgba(129, 140, 248, 0.05) 100%);
  border-radius: 16px;
  border: 1px solid rgba(96, 165, 250, 0.15);
  margin-bottom: 24px;
}

.subject-hero-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.subject-hero-icon {
  font-size: 48px;
}

.subject-hero-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 4px;
}

.subject-hero-subtitle {
  font-size: 14px;
  color: var(--text2);
}

.subject-hero-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.progress-ring-wrap {
  position: relative;
  width: 100px;
  height: 100px;
}

.progress-ring {
  width: 100px;
  height: 100px;
  transform: rotate(-90deg);
}

.progress-ring circle {
  transition: stroke-dashoffset 0.5s ease;
}

.progress-ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-percent {
  font-size: 20px;
  font-weight: 700;
  color: #60a5fa;
}

.progress-count {
  font-size: 13px;
  color: var(--text2);
}

/* 统计 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #60a5fa;
}

.stat-label {
  font-size: 13px;
  color: var(--text2);
  margin-top: 4px;
}

/* 知识网络 */
.mindmap-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.mindmap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.mindmap-node {
  background: var(--surface2);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.mindmap-node:hover {
  background: var(--surface3);
}

.mindmap-node-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
}

.mindmap-icon {
  font-size: 20px;
}

.mindmap-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.mindmap-toggle {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--surface3);
  color: var(--text2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
}

.mindmap-children {
  padding: 0 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mindmap-child {
  padding: 8px 12px;
  background: var(--surface);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text2);
}

/* 公式 */
.formula-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.formula-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.formula-card {
  padding: 16px;
  background: var(--surface2);
  border-radius: 10px;
}

.formula-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.formula-expression {
  font-size: 16px;
  font-weight: 700;
  color: #60a5fa;
  font-family: 'Courier New', monospace;
  margin-bottom: 8px;
  padding: 8px;
  background: var(--surface);
  border-radius: 6px;
}

.formula-desc {
  font-size: 13px;
  color: var(--text2);
  line-height: 1.5;
}

/* 错题本 */
.mistake-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}

.mistake-empty {
  text-align: center;
  padding: 40px;
}

.mistake-empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.mistake-empty p {
  font-size: 16px;
  color: var(--text);
  margin-bottom: 8px;
}

.mistake-hint {
  font-size: 13px;
  color: var(--text2);
}

/* 通用 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.section-subtitle {
  font-size: 12px;
  color: var(--text2);
}

@media (max-width: 768px) {
  .subject-hero {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  .mindmap-grid, .formula-grid {
    grid-template-columns: 1fr;
  }
}
</style>
