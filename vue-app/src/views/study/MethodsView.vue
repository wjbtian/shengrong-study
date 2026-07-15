<template>
  <div class="page-container">
    <div class="page-header"><h1 class="page-title">💡 学习方法</h1><p class="page-subtitle">掌握好的方法，学习事半功倍</p></div>
    <section class="section"><h2 class="section-title">📐 数学画图学习法</h2>
      <div class="mc">
        <div class="motto"><span class="mt">一画二标三标问，四看公式拿满分</span></div>
        <div class="steps">
          <div class="step" v-for="(s,i) in steps" :key="i">
            <div class="sn2">{{ i+1 }}</div>
            <div><strong>{{ s.t }}</strong><p>{{ s.d }}</p></div>
          </div>
        </div>
        <div class="ex"><h3>📌 平行四边形错题演示</h3>
          <div class="wvr">
            <div class="wv"><div class="wl">❌ 不画图</div><p>光看文字，容易选14米做错</p></div>
            <div class="ar">→</div>
            <div class="rv"><div class="wl">✅ 画图</div><p>画出来发现高9不能垂直于14（邻边8<9），只能对应底8 ✅</p></div>
          </div>
        </div>
      </div>
    </section>
    <section class="section"><h2 class="section-title">🎯 三个好习惯</h2>
      <div class="habits">
        <div class="hc" style="border-left-color:#2563eb"><div class="hn">1</div><div><h3>拿笔就画</h3><p>看到几何题第一件事画图，画出来脑子就不乱了</p></div></div>
        <div class="hc" style="border-left-color:#4ade80"><div class="hn">2</div><div><h3>数字标图</h3><p>所有数字标到图上，标完就能列等式</p></div></div>
        <div class="hc" style="border-left-color:#f59e0b"><div class="hn">3</div><div><h3>对图检查</h3><p>算出答案后看图：数在图上合理吗？</p></div></div>
      </div>
    </section>
    <section class="section"><h2 class="section-title">📖 语文学习建议</h2>
      <div class="tips"><div class="tip"><div class="ti2">📝</div><h3>出声朗读</h3><p>写好作文读一遍，不通顺立刻改</p></div>
      <div class="tip"><div class="ti2">📒</div><h3>好词好句本</h3><p>读到好词好句就记下来</p></div>
      <div class="tip"><div class="ti2">✏️</div><h3>每周听写</h3><p>易错成语词语每周过关</p></div></div>
    </section>
  </div>
</template>
<script setup>
const steps = [
  {t:'读题画草图',d:'把条件用图形画出来，示意就行'},
  {t:'标已知条件',d:'数字标在图上相应位置'},
  {t:'标未知数',d:'要求的量用?标出来'},
  {t:'看图标公式',d:'对着图找公式、找关系'}
];
</script>
<style scoped>
.page-container{max-width:900px;margin:0 auto}.page-header{margin-bottom:24px}.page-title{font-size:24px;font-weight:700;color:var(--text);margin:0}.page-subtitle{font-size:13px;color:var(--text2);margin-top:4px}
.section{margin-bottom:28px}.section-title{font-size:18px;font-weight:700;color:var(--text);margin-bottom:14px}
.mc{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px}.motto{text-align:center;padding:16px;margin-bottom:16px;background:linear-gradient(135deg,rgba(26,26,46,0.8),rgba(22,33,62,0.8));border-radius:10px}
.mt{font-size:20px;letter-spacing:3px;color:var(--accent);font-weight:700}.steps{display:flex;flex-direction:column;gap:10px;margin-bottom:16px}
.step{display:flex;gap:12px}.sn2{width:28px;height:28px;border-radius:50%;background:var(--accent-dim);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0}
.step strong{font-size:14px;color:var(--text)}.step p{font-size:13px;color:var(--text2);margin:2px 0}
.ex{background:var(--surface2);border-radius:10px;padding:16px}.ex h3{font-size:14px;color:var(--text);margin-bottom:10px}
.wvr{display:flex;gap:12px;align-items:center}.wv,.rv{flex:1;padding:12px;border-radius:8px}.wv{background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.2)}.rv{background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.2)}
.wl{font-weight:600;font-size:14px}.wv .wl{color:#f87171}.rv .wl{color:#4ade80}.wv p,.rv p{font-size:13px;color:var(--text2);margin:4px 0 0}.ar{font-size:20px;color:var(--text3)}
.habits{display:flex;flex-direction:column;gap:10px}.hc{display:flex;gap:14px;background:var(--surface);border:1px solid var(--border);border-left:4px solid;border-radius:10px;padding:16px 18px}
.hn{width:32px;height:32px;border-radius:50%;background:var(--surface2);color:var(--text);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;flex-shrink:0}
.hc h3{font-size:15px;font-weight:600;color:var(--text);margin-bottom:4px}.hc p{font-size:13px;color:var(--text2);margin:0}
.tips{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}.tip{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;text-align:center}
.ti2{font-size:28px;margin-bottom:8px}.tip h3{font-size:14px;font-weight:600;color:var(--text);margin-bottom:6px}.tip p{font-size:13px;color:var(--text2);margin:0;line-height:1.6}
</style>