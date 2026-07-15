<template>
  <SubjectLayout
    icon="🔢"
    title="数学学习"
    subtitle="苏教版四年级下册 · 8个单元 · 思维导图式学习"
    color="#60a5fa"
    :progressPercent="progressPercent"
    :doneCount="doneCount"
    :total="8"
    unitLabel="单元"
    :stats="[{ value: 16, label: '公式' }, { value: 0, label: '错题' }, { value: 0, label: '练习' }]"
  >
    <!-- 单元列表 -->
    <section class="units-section">
      <div class="section-header">
        <h2 class="section-title">📖 学习路线图</h2>
        <span class="section-subtitle">点击单元查看详细内容</span>
      </div>
      <div class="units-grid">
        <div
          v-for="unit in units"
          :key="unit.id"
          class="unit-card"
          :class="{ completed: unit.completed }"
          @click="openUnit(unit)"
        >
          <div class="unit-number">{{ unit.num }}</div>
          <div class="unit-info">
            <h3 class="unit-title">{{ unit.title }}</h3>
            <p class="unit-desc">{{ unit.desc }}</p>
          </div>
          <div class="unit-status">
            <span v-if="unit.completed" class="unit-check">✓</span>
            <span v-else class="unit-lock">🔒</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 重点公式 -->
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

    <!-- 单元详情弹窗 -->
    <div v-if="selectedUnit" class="modal" @click.self="selectedUnit = null">
      <div class="modal-content">
        <div class="modal-header">
          <h3>第{{ selectedUnit.num }}单元：{{ selectedUnit.title }}</h3>
          <button class="modal-close" @click="selectedUnit = null">✕</button>
        </div>
        <div class="modal-body">
          <div class="unit-detail-section">
            <h4>📖 知识点</h4>
            <div class="knowledge-list">
              <div v-for="(point, i) in selectedUnit.points" :key="i" class="knowledge-item">
                <span class="knowledge-dot">•</span>
                <span>{{ point }}</span>
              </div>
            </div>
          </div>
          <div v-if="selectedUnit.formulas?.length" class="unit-detail-section">
            <h4>📐 公式</h4>
            <div v-for="f in selectedUnit.formulas" :key="f.name" class="formula-item">
              <div class="formula-item-name">{{ f.name }}</div>
              <div class="formula-item-expr">{{ f.expr }}</div>
            </div>
          </div>
          <div class="unit-detail-section">
            <h4>🎯 重点难点</h4>
            <ul>
              <li v-for="(tip, i) in selectedUnit.tips" :key="i">{{ tip }}</li>
            </ul>
          </div>
          <!-- 完成标记按钮 -->
          <div class="unit-detail-section complete-action">
            <button 
              class="btn-complete" 
              :class="{ done: selectedUnit.completed }"
              @click="toggleUnitComplete(selectedUnit)"
            >
              {{ selectedUnit.completed ? '✅ 已完成 · 点击取消' : '🎯 标记为已完成' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </SubjectLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SubjectLayout from '../../components/SubjectLayout.vue'
import { useSubjectProgress } from '../../composables/useSubjectProgress.js'
import { getProgress, markProgress, unmarkProgress } from '../../utils/api.js'

const { units, doneCount, progressPercent } = useSubjectProgress('math_', 8)
const selectedUnit = ref(null)

// 初始化单元数据
units.value = [
  { id: 'math_1', num: 1, title: '计算器', desc: '认识计算器、用计算器计算、探索规律', completed: false,
    points: ['认识计算器', '用计算器计算', '探索规律'],
    formulas: [],
    tips: ['熟练使用计算器', '注意计算顺序'] },
  { id: 'math_2', num: 2, title: '平移、旋转和轴对称', desc: '图形的平移、旋转、轴对称', completed: false,
    points: ['图形的平移', '图形的旋转', '轴对称图形'],
    formulas: [],
    tips: ['平移不改变图形形状和大小', '旋转要找旋转中心'] },
  { id: 'math_3', num: 3, title: '认识多位数', desc: '亿以内数、亿以上数、数的改写与近似', completed: false,
    points: ['亿以内数的认识', '亿以上数的认识', '数的改写与近似'],
    formulas: [],
    tips: ['注意数位对齐', '改写用万或亿作单位'] },
  { id: 'math_4', num: 4, title: '三位数乘两位数', desc: '笔算乘法、数量关系、积的变化规律', completed: false,
    points: ['笔算乘法', '常见的数量关系', '积的变化规律'],
    formulas: [{ name: '路程', expr: '路程 = 速度 × 时间' }, { name: '总价', expr: '总价 = 单价 × 数量' }],
    tips: ['竖式计算注意对齐', '一个因数不变，另一个因数乘几，积也乘几'] },
  { id: 'math_5', num: 5, title: '用计算器探索规律', desc: '乘法规律、除法规律、有趣的算式', completed: false,
    points: ['乘法规律', '除法规律', '有趣的算式'],
    formulas: [],
    tips: ['用计算器验证猜想', '找规律要观察变化'] },
  { id: 'math_6', num: 6, title: '运算律', desc: '加法交换律和结合律、乘法分配律', completed: false,
    points: ['加法交换律和结合律', '乘法交换律和结合律', '乘法分配律', '简便运算'],
    formulas: [
      { name: '加法交换律', expr: 'a + b = b + a' },
      { name: '加法结合律', expr: '(a + b) + c = a + (b + c)' },
      { name: '乘法交换律', expr: 'a × b = b × a' },
      { name: '乘法结合律', expr: '(a × b) × c = a × (b × c)' },
      { name: '乘法分配律', expr: '(a + b) × c = a × c + b × c' },
    ],
    tips: ['乘法分配律是最常用的简便运算工具', '凑整是简便运算的核心思路'] },
  { id: 'math_7', num: 7, title: '三角形、平行四边形和梯形', desc: '认识三角形、内角和、平行四边形、梯形', completed: false,
    points: ['认识三角形', '三角形内角和', '认识平行四边形', '认识梯形'],
    formulas: [{ name: '三角形内角和', expr: '∠A + ∠B + ∠C = 180°' }],
    tips: ['三角形任意两边之和大于第三边', '三角形内角和恒为180°'] },
  { id: 'math_8', num: 8, title: '确定位置', desc: '用数对确定位置、在方格纸上确定位置', completed: false,
    points: ['用数对确定位置', '在方格纸上确定位置'],
    formulas: [],
    tips: ['数对先列后行', '(3,5)表示第3列第5行'] },
]

const formulas = ref([
  { name: '加法交换律', expr: 'a + b = b + a', desc: '两个数相加，交换加数的位置，和不变' },
  { name: '加法结合律', expr: '(a + b) + c = a + (b + c)', desc: '三个数相加，先把前两个数相加，或者先把后两个数相加，和不变' },
  { name: '乘法交换律', expr: 'a × b = b × a', desc: '两个数相乘，交换因数的位置，积不变' },
  { name: '乘法结合律', expr: '(a × b) × c = a × (b × c)', desc: '三个数相乘，先把前两个数相乘，或者先把后两个数相乘，积不变' },
  { name: '乘法分配律', expr: '(a + b) × c = a × c + b × c', desc: '两个数的和与一个数相乘，可以先把它们与这个数分别相乘，再相加' },
  { name: '三角形内角和', expr: '∠A + ∠B + ∠C = 180°', desc: '任意三角形的三个内角之和等于180度' },
])

function openUnit(unit) {
  selectedUnit.value = unit
}

async function toggleUnitComplete(unit) {
  try {
    const unitNum = unit.id.replace('math_', '')
    if (unit.completed) {
      await unmarkProgress('math', unitNum)
      unit.completed = false
    } else {
      await markProgress('math', unitNum)
      unit.completed = true
    }
  } catch (e) {
    console.error('标记单元完成失败:', e)
  }
}

onMounted(async () => {
  try {
    const data = await getProgress()
    const doneUnits = data.doneUnits || []
    units.value.forEach(unit => {
      unit.completed = doneUnits.includes(unit.id)
    })
  } catch (e) {
    console.error('加载进度失败:', e)
  }
})
</script>

<style scoped>
/* 单元列表 */
.units-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.units-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.unit-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--surface2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.unit-card:hover {
  background: var(--surface3);
  transform: translateY(-2px);
}

.unit-card.completed {
  border-color: #60a5fa;
}

.unit-number {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.unit-card.completed .unit-number {
  background: rgba(96, 165, 250, 0.3);
}

.unit-info {
  flex: 1;
  min-width: 0;
}

.unit-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 2px;
}

.unit-desc {
  font-size: 12px;
  color: var(--text2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unit-status {
  font-size: 18px;
}

.unit-check {
  color: #60a5fa;
}

/* 弹窗 */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.modal-content {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text2);
  font-size: 18px;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.unit-detail-section {
  margin-bottom: 20px;
}

.unit-detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #60a5fa;
  margin-bottom: 10px;
}

.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.knowledge-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--surface2);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text);
}

.knowledge-dot {
  color: #60a5fa;
  font-weight: bold;
}

.formula-item {
  padding: 12px;
  background: var(--surface2);
  border-radius: 8px;
  margin-bottom: 8px;
}

.formula-item-name {
  font-size: 14px;
  color: var(--text);
  font-weight: 600;
  margin-bottom: 4px;
}

.formula-item-expr {
  font-size: 15px;
  color: #60a5fa;
  font-family: 'Courier New', monospace;
}

/* 完成按钮 */
.complete-action {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.btn-complete {
  width: 100%;
  padding: 14px 24px;
  border-radius: 12px;
  border: 2px solid rgba(96, 165, 250, 0.5);
  background: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-complete:hover {
  background: rgba(96, 165, 250, 0.2);
  border-color: rgba(96, 165, 250, 0.7);
}

.btn-complete.done {
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

.btn-complete.done:hover {
  background: rgba(251, 191, 36, 0.2);
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
  .units-grid, .formula-grid {
    grid-template-columns: 1fr;
  }
}
</style>
