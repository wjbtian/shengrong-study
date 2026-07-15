<template>
  <div class="kt-page">
    <!-- 顶部 -->
    <div class="kt-header">
      <button class="kt-back" @click="$router.push('/study')">← 返回</button>
      <div class="kt-title-area">
        <h1 class="kt-title" v-if="!activeSubject">🌳 知识树</h1>
        <h1 class="kt-title" v-else>{{ treeData.title }}</h1>
        <p class="kt-subtitle" v-if="!activeSubject">选择学科，查看完整的知识体系</p>
        <p class="kt-subtitle" v-else>{{ treeData.publisher }} · 五年级上册</p>
      </div>
    </div>

    <!-- 学科选择 -->
    <div class="subject-tabs" v-if="!activeSubject">
      <div class="subject-card" v-for="s in subjects" :key="s.key" @click="loadTree(s.key)"
        :style="{ '--sub-color': s.color }">
        <div class="sc-icon">{{ s.icon }}</div>
        <div class="sc-info">
          <div class="sc-name">{{ s.name }}</div>
          <div class="sc-unit-count">{{ s.unitCount }} 个单元</div>
        </div>
        <div class="sc-arrow">→</div>
      </div>
    </div>

    <!-- 知识树内容 -->
    <div class="kt-content" v-if="activeSubject && treeData.units">
      <div class="unit-list">
        <div class="unit-card" v-for="unit in treeData.units" :key="unit.id"
          :style="{ '--unit-color': unitColor(unit.id) }"
          @click="toggleUnit(unit.id)">
          <div class="unit-header">
            <div class="unit-badge">{{ unit.id }}</div>
            <div class="unit-title-group">
              <div class="unit-title">{{ unit.title }}</div>
              <div class="unit-subtitle">{{ unit.subtitle }}</div>
            </div>
            <span class="unit-toggle">{{ expandedUnit === unit.id ? '−' : '+' }}</span>
          </div>

          <!-- 展开详情 -->
          <div class="unit-body" v-if="expandedUnit === unit.id">
            <!-- 学习目标 -->
            <div class="ub-section">
              <div class="ubs-title">🎯 学习目标</div>
              <ul class="ubs-list">
                <li v-for="(obj, i) in unit.objectives" :key="i">{{ obj }}</li>
              </ul>
            </div>

            <!-- 核心概念 -->
            <div class="ub-section" v-if="unit.core_concepts">
              <div class="ubs-title">💎 核心概念</div>
              <div class="concept-chips">
                <span class="concept-chip" v-for="c in unit.core_concepts" :key="c">{{ c }}</span>
              </div>
            </div>

            <!-- 课文/知识点列表 -->
            <div class="ub-section">
              <div class="ubs-title">
                {{ unit.lessons ? '📖 课文' : '📚 知识点' }}
                <span class="ubs-count">{{ (unit.lessons || unit.topics || []).length }} 项</span>
              </div>
              <div class="lesson-list">
                <div class="lesson-item" v-for="lesson in (unit.lessons || unit.topics)" :key="lesson.num || lesson.id">
                  <div class="li-left">
                    <span class="li-num" v-if="lesson.num">第{{ lesson.num }}课</span>
                    <span class="li-num" v-else>{{ lesson.id }}</span>
                    <span class="li-name">{{ lesson.title || lesson.name }}</span>
                  </div>
                  <div class="li-right">
                    <span class="li-type" :class="'type-' + (lesson.type || '').toLowerCase()">{{ lesson.type }}</span>
                    <span class="li-level" v-if="lesson.level" :class="'lv-' + lesson.level">{{ lesson.level }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 必背/活动 -->
            <div class="ub-section" v-if="unit.activities">
              <div class="ubs-title">📋 单元活动</div>
              <div class="activity-list">
                <div class="activity-item" v-for="act in unit.activities" :key="act">
                  <span v-if="act.includes(':')">{{ act.split(':')[0] }}：</span>
                  <span v-if="act.includes(':')" class="act-highlight">{{ act.split(':')[1] }}</span>
                  <span v-else>{{ act }}</span>
                </div>
              </div>
            </div>

            <div class="ub-section" v-if="unit.recitation && unit.recitation.length > 0">
              <div class="ubs-title">📜 背诵要求</div>
              <div class="recit-list">
                <div class="recit-item" v-for="r in unit.recitation" :key="r">🔖 {{ r }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../../utils/api'

const activeSubject = ref(null)
const treeData = ref({})
const expandedUnit = ref(null)

const subjects = [
  { key: 'chinese', name: '语文', icon: '📖', color: '#4ade80', unitCount: 8 },
  { key: 'math', name: '数学', icon: '🔢', color: '#60a5fa', unitCount: 8 },
  { key: 'english', name: '英语', icon: '🔤', color: '#f472b6', unitCount: 8 }
]

function unitColor(id) {
  const colors = ['#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#34d399', '#a78bfa', '#22d3ee', '#fb923c']
  const idx = parseInt(id.replace(/[CME]/, '')) - 1
  return colors[idx] || '#888'
}

async function loadTree(subject) {
  activeSubject.value = subject
  try {
    const data = await api('GET', `/knowledge/tree/${subject}`)
    treeData.value = data
  } catch(e) {
    console.error('加载知识树失败:', e)
  }
}

function toggleUnit(id) {
  expandedUnit.value = expandedUnit.value === id ? null : id
}
</script>

<style scoped>
.kt-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px 40px;
  animation: pageEnter 0.5s ease;
}
@keyframes pageEnter { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.kt-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  padding-top: 10px;
}
.kt-back {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.03);
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.kt-back:hover { background: rgba(255,255,255,0.06); color: var(--text); }
.kt-title-area { flex: 1; }
.kt-title { font-size: 24px; font-weight: 800; color: var(--text); margin: 0; }
.kt-subtitle { font-size: 13px; color: var(--text2); margin-top: 4px; }

/* 学科选择 */
.subject-tabs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.subject-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-radius: 18px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  cursor: pointer;
  transition: all 0.35s var(--ease-spring);
}
.subject-card:hover {
  transform: translateX(6px);
  border-color: var(--sub-color);
  background: rgba(255,255,255,0.04);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
.sc-icon { font-size: 36px; }
.sc-info { flex: 1; }
.sc-name { font-size: 18px; font-weight: 800; color: var(--text); }
.sc-unit-count { font-size: 12px; color: var(--text2); margin-top: 2px; }
.sc-arrow { font-size: 18px; color: var(--text3); transition: all 0.3s; }
.subject-card:hover .sc-arrow { color: var(--sub-color); transform: translateX(4px); }

/* 单元列表 */
.unit-list { display: flex; flex-direction: column; gap: 10px; }

.unit-card {
  border-radius: 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}
.unit-card:hover { border-color: var(--unit-color); }

.unit-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
}
.unit-badge {
  width: 40px; height: 40px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, var(--unit-color) 12%, transparent);
  color: var(--unit-color);
  font-size: 12px; font-weight: 800;
  flex-shrink: 0;
}
.unit-title-group { flex: 1; }
.unit-title { font-size: 16px; font-weight: 700; color: var(--text); }
.unit-subtitle { font-size: 12px; color: var(--text2); margin-top: 2px; }
.unit-toggle {
  font-size: 20px; color: var(--text3);
  transition: transform 0.3s;
}

/* 展开内容 */
.unit-body { padding: 0 20px 20px; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 16px; animation: slideDown 0.3s ease; }
@keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 2000px; } }

.ub-section { margin-bottom: 16px; }
.ubs-title {
  font-size: 13px; font-weight: 700; color: var(--text);
  margin-bottom: 8px;
  display: flex; align-items: center; gap: 8px;
}
.ubs-count { font-size: 11px; color: var(--text3); font-weight: 500; }
.ubs-list { padding-left: 20px; }
.ubs-list li { font-size: 13px; color: var(--text2); line-height: 1.7; }

.concept-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.concept-chip {
  padding: 4px 12px; border-radius: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.05);
  font-size: 12px; color: var(--text2);
}

.lesson-list { display: flex; flex-direction: column; gap: 6px; }
.lesson-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(255,255,255,0.02);
  transition: background 0.2s;
}
.lesson-item:hover { background: rgba(255,255,255,0.04); }
.li-left { display: flex; align-items: center; gap: 10px; }
.li-num { font-size: 11px; color: var(--text3); font-weight: 600; }
.li-name { font-size: 13px; color: var(--text); font-weight: 500; }
.li-right { display: flex; gap: 6px; }
.li-type {
  font-size: 10px; padding: 2px 8px; border-radius: 6px; font-weight: 600;
}
.type-精读 { background: rgba(74,222,128,0.12); color: #4ade80; }
.type-略读 { background: rgba(129,140,248,0.12); color: #818cf8; }
.type-概念理解, .type-技能, .type-方法, .type-应用, .type-综合应用 { background: rgba(96,165,250,0.12); color: #60a5fa; }
.type-公式推导 { background: rgba(74,222,128,0.12); color: #4ade80; }
.type-词汇 { background: rgba(244,114,182,0.12); color: #f472b6; }
.type-语法 { background: rgba(251,191,36,0.12); color: #fbbf24; }
.type-语言技能 { background: rgba(34,211,238,0.12); color: #22d3ee; }

.li-level {
  font-size: 10px; padding: 2px 8px; border-radius: 6px; font-weight: 600;
}
.lv-掌握 { background: rgba(74,222,128,0.12); color: #4ade80; }
.lv-理解 { background: rgba(129,140,248,0.12); color: #818cf8; }
.lv-了解 { background: rgba(148,163,184,0.12); color: #94a3b8; }

.activity-list { display: flex; flex-wrap: wrap; gap: 6px; }
.activity-item {
  padding: 6px 12px; border-radius: 8px;
  background: rgba(255,255,255,0.03);
  font-size: 12px; color: var(--text2);
}
.act-highlight { color: var(--text); font-weight: 600; }

.recit-list { display: flex; flex-direction: column; gap: 4px; }
.recit-item { font-size: 12px; color: var(--accent); padding: 4px 0; }

@media (max-width: 768px) {
  .kt-header { flex-direction: column; align-items: flex-start; }
}
</style>
