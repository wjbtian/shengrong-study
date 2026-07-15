<template>
  <div class="page-container">
    <div class="page-header"><h1 class="page-title">📊 学习报告</h1><p class="page-subtitle">总结学习情况，发现薄弱环节</p></div>
    <section class="section"><h2 class="section-title">📖 作文批阅记录</h2>
      <div class="essay-card">
        <div class="essay-header"><h3>《我最推荐的一本书》</h3><span class="essay-date">2026-07-14</span></div>
        <div class="essay-meta"><span class="tag tag-yellow">习作</span><span class="tag tag-blue">🔵 学习中</span></div>
        <div class="score-grid">
          <div class="si"><span class="sl">结构</span><span class="ss">⭐⭐⭐⭐</span></div>
          <div class="si"><span class="sl">表达</span><span class="ss">⭐⭐⭐</span></div>
          <div class="si"><span class="sl">字词</span><span class="ss">⭐⭐</span></div>
          <div class="si"><span class="sl">结尾</span><span class="ss">⭐⭐⭐</span></div>
        </div>
        <div class="essay-problems"><h4>📌 发现的问题</h4>
          <div class="pi"><span class="tag tag-red">错别字</span><span>火眼睛金 → 火眼金睛</span></div>
          <div class="pi"><span class="tag tag-red">错别字</span><span>轻言轻弃 → 轻言放弃</span></div>
          <div class="pi"><span class="tag tag-yellow">病句</span><span>缺主语、缺转折词</span></div>
          <div class="pi"><span class="tag tag-blue">用词</span><span>本领高→本领高强；心很善良→心地善良</span></div>
          <div class="pi"><span class="tag tag-gray">标点</span><span>句尾缺句号</span></div>
          <div class="pi"><span class="tag tag-gray">结尾</span><span>太套路化，缺针对性</span></div>
        </div>
      </div>
    </section>
    <section class="section"><h2 class="section-title">❌ 错题统计</h2>
      <div class="stats-simple">
        <div class="ss2"><span class="sn">{{ stats.total || 0 }}</span><span class="sd">总错题</span></div>
        <div class="ss2" v-for="s in stats.bySubject||[]" :key="s.subject"><span class="sn">{{ s.count }}</span><span class="sd">{{ s.subject }}</span></div>
      </div>
    </section>
    <section class="section"><h2 class="section-title">💡 学习建议</h2>
      <div class="tips"><div class="tip"><div class="tip-icon">✍️</div><h3>每日听写</h3><p>易错词每周听写，直到完全掌握</p></div>
      <div class="tip"><div class="tip-icon">📖</div><h3>出声朗读</h3><p>写完作文读一遍，不通顺的马上改</p></div>
      <div class="tip"><div class="tip-icon">📐</div><h3>先画图</h3><p>数学题先画图再下笔</p></div></div>
    </section>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../utils/api';
const stats = ref({});
onMounted(async () => { try { stats.value = await api('GET','/errors/stats') } catch(e){} });
</script>
<style scoped>
.page-container{max-width:900px;margin:0 auto}.page-header{margin-bottom:24px}.page-title{font-size:24px;font-weight:700;color:var(--text);margin:0}.page-subtitle{font-size:13px;color:var(--text2);margin-top:4px}
.section{margin-bottom:28px}.section-title{font-size:18px;font-weight:700;color:var(--text);margin-bottom:14px}
.essay-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px}
.essay-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.essay-header h3{font-size:16px;font-weight:600;color:var(--text);margin:0}.essay-date{font-size:12px;color:var(--text3)}.essay-meta{display:flex;gap:6px;margin-bottom:14px}
.tag{display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600}.tag-red{background:rgba(248,113,113,0.15);color:#f87171}.tag-yellow{background:rgba(251,191,36,0.15);color:#fbbf24}.tag-blue{background:rgba(96,165,250,0.15);color:#60a5fa}.tag-gray{background:rgba(136,136,160,0.15);color:#8888a0}
.score-grid{display:flex;gap:12px;margin-bottom:16px}.si{display:flex;flex-direction:column;align-items:center}.sl{font-size:12px;color:var(--text2)}.ss{font-size:14px;letter-spacing:1px}
.essay-problems h4{font-size:14px;color:var(--text);margin-bottom:8px}.pi{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text2);padding:5px 0}
.stats-simple{display:flex;gap:12px;flex-wrap:wrap}.ss2{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px 20px;text-align:center;min-width:100px;flex:1}
.sn{display:block;font-size:24px;font-weight:700;color:var(--accent)}.sd{font-size:12px;color:var(--text2)}
.tips{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}.tip{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;text-align:center}
.tip-icon{font-size:28px;margin-bottom:8px}.tip h3{font-size:14px;font-weight:600;color:var(--text);margin-bottom:6px}.tip p{font-size:13px;color:var(--text2);margin:0;line-height:1.6}
</style>