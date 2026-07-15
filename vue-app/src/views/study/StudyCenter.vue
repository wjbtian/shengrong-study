<template>
  <div class="study-home">
    <!-- ═══ 顶部：等级 + 欢迎 ═══ -->
    <div class="study-top-bar">
      <div class="stb-level">
        <div class="stb-level-icon">🚀</div>
        <div class="stb-level-body">
          <span class="stb-level-label">探索等级</span>
          <span class="stb-level-value">Lv.{{ level }}</span>
        </div>
      </div>

      <div class="stb-greeting">
        <h2 class="stb-title">
          今天探索
          <span class="stb-highlight">什么知识？</span>
        </h2>
        <p class="stb-desc">每一次学习都是星际旅行，错题也是宝藏</p>
      </div>

      <div class="stb-stats">
        <div class="stb-stat" v-for="s in heroStats" :key="s.label">
          <div class="stb-stat-value" :style="{ color: s.color }">{{ s.value }}</div>
          <div class="stb-stat-label">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <!-- ═══ 学科舰队（非传统布局 - 轨道/雷达式） ═══ -->
    <section class="subject-fleet">
      <div class="fleet-label">
        <span class="fleet-dot"></span>
        学科舰队
        <span class="fleet-dot"></span>
      </div>

      <div class="fleet-orbit">
        <!-- 中心发光球 -->
        <div class="orbit-core">
          <div class="oc-icon">🎯</div>
          <div class="oc-text">探索</div>
          <div class="oc-glow"></div>
        </div>

        <!-- 学科卡片以轨道布局排列 -->
        <router-link to="/study/chinese" class="fleet-card card-1" style="--card-x: 0px; --card-y: -140px;">
          <div class="fc-glow" style="background: rgba(74,222,128,0.15);"></div>
          <div class="fc-ring" style="border-color: rgba(74,222,128,0.15);"></div>
          <div class="fc-icon-wrap" style="background: rgba(74,222,128,0.12);">📖</div>
          <div class="fc-name" style="color: #4ade80;">语文</div>
          <div class="fc-desc">课文 · 古诗</div>
          <div class="fc-progress">
            <div class="fc-bar" style="background: rgba(74,222,128,0.1);">
              <div class="fc-fill" style="background: #4ade80; width: {{ subjectPct('chinese') }}%"></div>
            </div>
          </div>
          <div class="fc-arrow">→</div>
        </router-link>

        <router-link to="/study/math" class="fleet-card card-2" style="--card-x: 132px; --card-y: -44px;">
          <div class="fc-glow" style="background: rgba(96,165,250,0.15);"></div>
          <div class="fc-ring" style="border-color: rgba(96,165,250,0.15);"></div>
          <div class="fc-icon-wrap" style="background: rgba(96,165,250,0.12);">🔢</div>
          <div class="fc-name" style="color: #60a5fa;">数学</div>
          <div class="fc-desc">方程 · 几何</div>
          <div class="fc-progress">
            <div class="fc-bar" style="background: rgba(96,165,250,0.1);">
              <div class="fc-fill" style="background: #60a5fa; width: {{ subjectPct('math') }}%"></div>
            </div>
          </div>
          <div class="fc-arrow">→</div>
        </router-link>

        <router-link to="/study/english" class="fleet-card card-3" style="--card-x: 82px; --card-y: 114px;">
          <div class="fc-glow" style="background: rgba(244,114,182,0.15);"></div>
          <div class="fc-ring" style="border-color: rgba(244,114,182,0.15);"></div>
          <div class="fc-icon-wrap" style="background: rgba(244,114,182,0.12);">🔤</div>
          <div class="fc-name" style="color: #f472b6;">英语</div>
          <div class="fc-desc">单词 · 对话</div>
          <div class="fc-progress">
            <div class="fc-bar" style="background: rgba(244,114,182,0.1);">
              <div class="fc-fill" style="background: #f472b6; width: {{ subjectPct('english') }}%"></div>
            </div>
          </div>
          <div class="fc-arrow">→</div>
        </router-link>

        <router-link to="/study/olympiad" class="fleet-card card-4" style="--card-x: -82px; --card-y: 114px;">
          <div class="fc-glow" style="background: rgba(251,191,36,0.15);"></div>
          <div class="fc-ring" style="border-color: rgba(251,191,36,0.15);"></div>
          <div class="fc-icon-wrap" style="background: rgba(251,191,36,0.12);">🧩</div>
          <div class="fc-name" style="color: #fbbf24;">奥数</div>
          <div class="fc-desc">思维 · 挑战</div>
          <div class="fc-progress">
            <div class="fc-bar" style="background: rgba(251,191,36,0.1);">
              <div class="fc-fill" style="background: #fbbf24; width: {{ subjectPct('olympiad') }}%"></div>
            </div>
          </div>
          <div class="fc-arrow">→</div>
        </router-link>

        <router-link to="/study/report" class="fleet-card card-5" style="--card-x: -132px; --card-y: -44px;">
          <div class="fc-glow" style="background: rgba(34,211,238,0.15);"></div>
          <div class="fc-ring" style="border-color: rgba(34,211,238,0.15);"></div>
          <div class="fc-icon-wrap" style="background: rgba(34,211,238,0.12);">📊</div>
          <div class="fc-name" style="color: #22d3ee;">报告</div>
          <div class="fc-desc">成绩分析</div>
          <div class="fc-progress">
            <div class="fc-bar" style="background: rgba(34,211,238,0.1);">
              <div class="fc-fill" style="background: #22d3ee; width: 65%"></div>
            </div>
          </div>
          <div class="fc-arrow">→</div>
        </router-link>
      </div>
    </section>

    <!-- ═══ 底部功能区 ═══ -->
    <div class="study-dock">
      <!-- 错题本快捷入口 -->
      <router-link to="/study/errors" class="dock-card dock-errors">
        <div class="dc-bg-orb"></div>
        <div class="dc-content">
          <div class="dc-icon">📝</div>
          <div class="dc-body">
            <div class="dc-title">错题本</div>
            <div class="dc-stats">
              <span class="dc-stat" style="color: #f472b6;">{{ stats.total || 0 }} 条记录</span>
              <span v-if="stats.bySubject?.length" class="dc-stat-sep">·</span>
              <span class="dc-stat" v-for="s in (stats.bySubject||[]).slice(0,2)" :key="s.subject" style="color: var(--text2)">{{ s.subject }} {{ s.count }}</span>
            </div>
          </div>
          <div class="dc-arrow-wrap">
            <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 10h12M10 4l6 6-6 6"/></svg>
          </div>
        </div>
      </router-link>

      <!-- 知识树 -->
      <router-link to="/study/knowledge-tree" class="dock-card dock-tree">
        <div class="dc-bg-orb"></div>
        <div class="dc-content">
          <div class="dc-icon">🌳</div>
          <div class="dc-body">
            <div class="dc-title">知识树</div>
            <div class="dc-stats">完整知识体系</div>
          </div>
          <div class="dc-arrow-wrap">
            <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 10h12M10 4l6 6-6 6"/></svg>
          </div>
        </div>
      </router-link>

      <!-- 错题打印 -->
      <router-link to="/study/print" class="dock-card dock-print">
        <div class="dc-bg-orb"></div>
        <div class="dc-content">
          <div class="dc-icon">🖨️</div>
          <div class="dc-body">
            <div class="dc-title">错题打印</div>
            <div class="dc-stats">按阶段一键打印</div>
          </div>
          <div class="dc-arrow-wrap">
            <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 10h12M10 4l6 6-6 6"/></svg>
          </div>
        </div>
      </router-link>

      <!-- 学习方法 -->
      <router-link to="/study/methods" class="dock-card dock-methods">
        <div class="dc-bg-orb"></div>
        <div class="dc-content">
          <div class="dc-icon">💡</div>
          <div class="dc-body">
            <div class="dc-title">学习方法</div>
            <div class="dc-stats">画图法 · 好习惯</div>
          </div>
          <div class="dc-arrow-wrap">
            <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 10h12M10 4l6 6-6 6"/></svg>
          </div>
        </div>
      </router-link>

      <!-- 错题分类统计 -->
      <div class="dock-chart" v-if="stats.byCategory?.length">
        <div class="dc-header">
          <span class="dc-title">错题分类</span>
          <span class="dc-see-all">统计</span>
        </div>
        <div class="chart-rows">
          <div class="chart-row" v-for="cat in stats.byCategory" :key="cat.category">
            <span class="cr-label">{{ cat.category }}</span>
            <div class="cr-track">
              <div class="cr-fill" :style="{ width: (cat.count / maxCat * 100) + '%', background: catColor(cat.category) }"></div>
            </div>
            <span class="cr-value">{{ cat.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../../utils/api'
import { getProgress } from '../../utils/api.js'

const stats = ref({})
const progress = ref({})
const subjects = ref([])

const maxCat = computed(() => {
  const c = stats.value.byCategory || []
  return c.length > 0 ? Math.max(...c.map(x => x.count)) : 1
})

function catColor(cat) {
  const m = { '字词':'#4ade80', '病句':'#f472b6', '概念':'#60a5fa', '计算':'#fbbf24', '标点':'#fb923c', '作文':'#a78bfa', '阅读':'#22d3ee' }
  return m[cat] || '#888'
}

function subjectPct(key) {
  const s = subjects.value.find(x => x.key === key)
  return s ? s.percent : 0
}

const heroStats = computed(() => [
  { value: stats.value.total || 0, label: '错题', color: '#f472b6' },
  { value: (stats.value.bySubject || []).length, label: '学科', color: '#4ade80' },
  { value: (stats.value.byMastery || []).filter(x => x.mastery?.includes('已掌握'))[0]?.count || 0, label: '已掌握', color: '#60a5fa' }
])

// 等级 = 根据总错题数 + 已掌握数
const level = computed(() => {
  const total = stats.value.total || 0
  const mastered = (stats.value.byMastery || []).filter(x => x.mastery?.includes('已掌握'))[0]?.count || 0
  return Math.floor((total + mastered) / 3) + 1
})

onMounted(async () => {
  try { stats.value = await api('GET', '/errors/stats') } catch(e) {}
  try {
    const p = await getProgress()
    progress.value = p
    const doneUnits = p.doneUnits || []
    const doneOM = p.doneOM || []
    const getDone = (prefix) => doneUnits.filter(u => u.startsWith(prefix)).length
    subjects.value = [
      { key: 'chinese', completed: getDone('chinese_'), total: 8 },
      { key: 'math', completed: getDone('math_'), total: 8 },
      { key: 'english', completed: getDone('english_'), total: 8 },
      { key: 'olympiad', completed: doneOM.length, total: 20 },
    ].map(s => ({ ...s, percent: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0 }))
  } catch(e) {}
})
</script>

<style scoped>
.study-home {
  max-width: 960px !important;
  margin: 0 auto;
  padding: 20px 20px 60px;
  animation: studyEnter 0.6s ease;
}
@keyframes studyEnter { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* ═══════════════════════════════════════════
   顶部栏
   ═══════════════════════════════════════════ */
.study-top-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 40px;
  padding: 20px 28px;
  background: linear-gradient(135deg, rgba(129,140,248,0.05), rgba(74,222,128,0.03));
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,0.03);
}

.stb-level {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 18px;
  background: rgba(255,255,255,0.02);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.04);
  flex-shrink: 0;
}
.stb-level-icon { font-size: 24px; animation: float-slow 4s ease-in-out infinite; }
.stb-level-body { display: flex; flex-direction: column; }
.stb-level-label { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; }
.stb-level-value { font-size: 20px; font-weight: 900; color: var(--accent2); text-shadow: 0 0 20px rgba(129,140,248,0.3); }

.stb-greeting { flex: 1; }
.stb-title { font-size: 28px; font-weight: 800; line-height: 1.2; margin: 0; }
.stb-highlight {
  background: linear-gradient(135deg, #818cf8, #4ade80);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.stb-desc { font-size: 13px; color: var(--text2); margin-top: 4px; }

.stb-stats { display: flex; gap: 16px; flex-shrink: 0; }
.stb-stat { text-align: center; }
.stb-stat-value { font-size: 24px; font-weight: 900; line-height: 1; }
.stb-stat-label { font-size: 11px; color: var(--text2); margin-top: 2px; }

/* ═══════════════════════════════════════════
   学科舰队 - 非传统轨道布局
   ═══════════════════════════════════════════ */
.subject-fleet { margin-bottom: 32px; }

.fleet-label {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; font-weight: 700; color: var(--text2);
  text-transform: uppercase; letter-spacing: 2px;
  justify-content: center; margin-bottom: 24px;
}
.fleet-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--text3); }

.fleet-orbit {
  position: relative;
  width: 340px;
  height: 340px;
  margin: 0 auto;
}

/* 中心球 */
.orbit-core {
  position: absolute;
  left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  width: 70px; height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(74,222,128,0.08), rgba(129,140,248,0.08));
  border: 1px solid rgba(255,255,255,0.06);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  z-index: 2;
}
.oc-icon { font-size: 20px; }
.oc-text { font-size: 10px; font-weight: 700; color: var(--text2); margin-top: 2px; }
.oc-glow {
  position: absolute; inset: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(74,222,128,0.1), transparent 70%);
  animation: pulse-core 3s ease-in-out infinite;
  pointer-events: none;
}
@keyframes pulse-core { 0%,100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.15); opacity: 1; } }

/* 学科卡片 - 绕轨道排布 */
.fleet-card {
  position: absolute;
  left: 50%; top: 50%;
  width: 180px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  text-decoration: none;
  transition: all 0.4s var(--ease-spring);
  overflow: hidden;
  animation: cardLaunch 0.6s var(--ease-spring) backwards;
}
@keyframes cardLaunch {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  to { opacity: 1; transform: translate(-50%, -50%) translate(var(--card-x), var(--card-y)); }
}

.fleet-card:nth-child(2) { animation-delay: 0.1s; }
.fleet-card:nth-child(3) { animation-delay: 0.2s; }
.fleet-card:nth-child(4) { animation-delay: 0.3s; }
.fleet-card:nth-child(5) { animation-delay: 0.4s; }
.fleet-card:nth-child(6) { animation-delay: 0.5s; }

.fleet-card:hover {
  transform: translate(-50%, -50%) translate(var(--card-x), var(--card-y)) translateY(-6px) scale(1.03);
  border-color: var(--fc-color, rgba(255,255,255,0.1));
  box-shadow: 0 12px 30px rgba(0,0,0,0.3);
}

.fc-glow {
  position: absolute; inset: 0;
  opacity: 0; transition: opacity 0.4s;
}
.fleet-card:hover .fc-glow { opacity: 1; }

.fc-ring {
  position: absolute; inset: -6px;
  border-radius: inherit;
  border: 1px solid transparent;
  transition: all 0.4s;
}
.fleet-card:hover .fc-ring { transform: scale(1.04); opacity: 0; }

.fc-icon-wrap {
  width: 36px; height: 36px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  margin-bottom: 8px;
}

.fc-name { font-size: 16px; font-weight: 800; margin-bottom: 3px; }
.fc-desc { font-size: 11px; color: var(--text2); margin-bottom: 10px; }
.fc-progress { margin-bottom: 4px; }
.fc-bar { height: 3px; border-radius: 2px; overflow: hidden; }
.fc-fill { height: 100%; border-radius: 2px; transition: width 1.5s ease; }

.fc-arrow {
  position: absolute; top: 14px; right: 14px;
  font-size: 14px; color: var(--text3);
  transition: all 0.3s;
}
.fleet-card:hover .fc-arrow { transform: translateX(4px); }

/* 各卡片位置 */
.fleet-card.card-1 { transform: translate(-50%, -50%) translate(0px, -140px); }
.fleet-card.card-2 { transform: translate(-50%, -50%) translate(132px, -44px); }
.fleet-card.card-3 { transform: translate(-50%, -50%) translate(82px, 114px); }
.fleet-card.card-4 { transform: translate(-50%, -50%) translate(-82px, 114px); }
.fleet-card.card-5 { transform: translate(-50%, -50%) translate(-132px, -44px); }

.fleet-card.card-1:hover { border-color: rgba(74,222,128,0.3); }
.fleet-card.card-2:hover { border-color: rgba(96,165,250,0.3); }
.fleet-card.card-3:hover { border-color: rgba(244,114,182,0.3); }
.fleet-card.card-4:hover { border-color: rgba(251,191,36,0.3); }
.fleet-card.card-5:hover { border-color: rgba(34,211,238,0.3); }

/* ═══════════════════════════════════════════
   底部功能区
   ═══════════════════════════════════════════ */
.study-dock {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

/* 快捷入口卡片 */
.dock-card {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.04);
  text-decoration: none;
  transition: all 0.35s var(--ease-spring);
  min-height: 80px;
}
.dock-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.3);
}
.dock-errors { background: linear-gradient(135deg, rgba(244,114,182,0.06), rgba(244,114,182,0.02)); }
.dock-methods { background: linear-gradient(135deg, rgba(251,191,36,0.06), rgba(251,191,36,0.02)); }
.dock-tree { background: linear-gradient(135deg, rgba(74,222,128,0.06), rgba(74,222,128,0.02)); }

.dc-bg-orb {
  position: absolute;
  width: 120px; height: 120px;
  border-radius: 50%;
  top: -40px; right: -20px;
  background: radial-gradient(circle, currentColor, transparent 70%);
  opacity: 0.04;
  pointer-events: none;
}
.dock-errors .dc-bg-orb { color: #f472b6; }
.dock-methods .dc-bg-orb { color: #fbbf24; }
.dock-tree .dc-bg-orb { color: #4ade80; }
.dock-print { background: linear-gradient(135deg, rgba(34,211,238,0.06), rgba(34,211,238,0.02)); }
.dock-print .dc-bg-orb { color: #22d3ee; }

.dc-content {
  position: relative; z-index: 1;
  display: flex; align-items: center;
  gap: 14px; padding: 20px;
}

.dc-icon { font-size: 28px; flex-shrink: 0; }
.dc-body { flex: 1; }
.dc-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.dc-stats { font-size: 12px; color: var(--text2); display: flex; gap: 6px; flex-wrap: wrap; }
.dc-stat-sep { color: var(--text3); }

.dc-arrow-wrap {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  display: flex; align-items: center; justify-content: center;
  color: var(--text3);
  transition: all 0.3s;
  flex-shrink: 0;
}
.dock-card:hover .dc-arrow-wrap {
  background: rgba(74,222,128,0.1);
  color: var(--accent);
  transform: translateX(4px);
}

/* 错题分类图表 */
.dock-chart {
  padding: 18px 20px;
  border-radius: 20px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
}
.dc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.dc-header .dc-title { font-size: 13px; font-weight: 700; color: var(--text); margin: 0; }
.dc-see-all { font-size: 11px; color: var(--text3); }
.chart-rows { display: flex; flex-direction: column; gap: 6px; }
.chart-row { display: flex; align-items: center; gap: 8px; }
.cr-label { width: 36px; font-size: 11px; color: var(--text2); flex-shrink: 0; }
.cr-track { flex: 1; height: 5px; background: rgba(255,255,255,0.03); border-radius: 3px; overflow: hidden; }
.cr-fill { height: 100%; border-radius: 3px; transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
.cr-value { width: 18px; text-align: right; font-size: 11px; font-weight: 700; color: var(--text); }

/* ═══════════════════════════════════════════
   响应式
   ═══════════════════════════════════════════ */
@media (max-width: 800px) {
  .fleet-orbit { width: 100%; height: auto; display: flex; flex-direction: column; gap: 10px; }
  .orbit-core { display: none; }
  .fleet-card {
    position: static;
    transform: none !important;
    width: 100%;
    animation: cardAppear 0.5s backwards;
    flex-direction: row;
  }
  .fleet-card:nth-child(2),
  .fleet-card:nth-child(3),
  .fleet-card:nth-child(4),
  .fleet-card:nth-child(5),
  .fleet-card:nth-child(6) {
    transform: none !important;
  }
  .fleet-card:hover { transform: translateY(-4px) !important; }
  .study-dock { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 900px) { .study-dock { grid-template-columns: 1fr 1fr; } }
@media (max-width: 768px) {
  .study-home { padding: 10px 12px 80px; }
  .study-top-bar { flex-direction: column; gap: 16px; padding: 16px 20px; }
  .stb-stats { width: 100%; justify-content: space-around; }
  .stb-title { font-size: 22px; }
  .study-dock { grid-template-columns: 1fr; }
}
</style>
