<template>
  <div class="print-page">
    <!-- 顶部控制 -->
    <div class="print-controls no-print">
      <button class="pc-back" @click="$router.push('/study')">← 返回</button>
      <div class="pc-title-area">
        <h1 class="pc-title">📝 错题练习</h1>
        <p class="pc-subtitle">按「一生一案」五阶复习法编排，不同类型的错题有不同的练习方式</p>
      </div>
    </div>

    <!-- 阶段选择 -->
    <div class="phase-select no-print" v-if="!selectedPhase">
      <div class="ps-intro">
        <h2>选择练习阶段</h2>
        <p>不同阶段有不同的练习方法和建议用时</p>
      </div>
      <div class="ps-grid">
        <div class="ps-card" v-for="p in phaseDefs" :key="p.key"
          :style="{ '--pc': p.color }"
          @click="selectPhase(p.key)">
          <div class="psc-emoji">{{ p.emoji }}</div>
          <div class="psc-name">{{ p.name }}</div>
          <div class="psc-time">⏱ {{ p.time }}</div>
          <div class="psc-desc">{{ p.desc }}</div>
          <div class="psc-action">开始练习 →</div>
        </div>
      </div>
    </div>

    <!-- 练习页面 -->
    <template v-if="selectedPhase">
      <div class="action-bar no-print">
        <button class="ab-back" @click="selectedPhase = null; paperData = null">← 切换阶段</button>
        <div class="ab-info" v-if="paperData">
          {{ paperData.totalErrors }} 道题 · {{ paperData.pedagogy.timeLimit }}
        </div>
        <div class="ab-actions">
          <label class="ab-toggle">
            <input type="checkbox" v-model="showAnswers">
            <span class="toggle-track-sm"><span class="toggle-knob-sm"></span></span>
            <span>{{ showAnswers ? '📖 显示答案' : '🙈 隐藏答案' }}</span>
          </label>
          <button class="ab-download" @click="downloadDocx" :disabled="downloading">
            {{ downloading ? '生成中...' : '📥 下载 Word 文档' }}
          </button>
        </div>
      </div>

      <div class="pedagogy-box" v-if="paperData">
        <div class="pb-header">
          <span class="pb-title">{{ paperData.pedagogy.title }}</span>
          <span class="pb-time">⏱ {{ paperData.pedagogy.timeLimit }}</span>
        </div>
        <p class="pb-desc">{{ paperData.pedagogy.description }}</p>
        <div class="pb-steps">
          <div class="pb-step" v-for="(inst, i) in paperData.pedagogy.instructions" :key="i">{{ inst }}</div>
        </div>
      </div>

      <div class="loading-state" v-if="!paperData && selectedPhase">
        <div class="ls-spinner"></div>
        <p>正在生成练习...</p>
      </div>

      <!-- ========== 错题列表 ========== -->
      <div class="exercise-list" v-if="paperData && paperData.groups">
        <template v-for="(group, gi) in paperData.groups" :key="gi">
          <!-- 分组标题 -->
          <div class="ex-group-header" v-if="group.name !== '混合练习'">
            <span class="exg-icon">{{ groupIcon(group.name) }}</span>
            <span class="exg-name">{{ group.name }}</span>
            <span class="exg-count">{{ group.errors.length }} 题</span>
          </div>

          <div class="ex-item" v-for="(err, i) in group.errors" :key="err.id"
            :style="{ animationDelay: i * 0.05 + 's' }">

            <!-- 题号 + 标签 -->
            <div class="ex-header">
              <span class="ex-num">#{{ i + 1 }}</span>
              <span class="ex-tag" :class="'tag-' + subjTag(err.subject)">{{ err.subject }}</span>
              <span class="ex-cat" :style="{ background: catBg(err.category), color: catColor(err.category) }">{{ err.category }}</span>
              <span class="ex-tag-type" v-if="err.display?.mode?.label">{{ err.display.mode.label }}</span>
            </div>

            <!-- ===== 标题：根据类型决定是否隐藏答案 ===== -->
            <!-- 字词默写/词语搭配：标题里的正确答案要遮住 -->
            <div class="ex-title" v-if="err.practice_type === '字词默写' || err.practice_type === '词语搭配'">
              {{ maskTitle(err.title, err.correct_text) }}
            </div>
            <!-- 其他类型：正常显示标题 -->
            <div class="ex-title" v-else>{{ err.title }}</div>

            <!-- ===== 不同类型的练习展示 ===== -->

            <!-- 字词默写/词语搭配：填空模式 -->
            <template v-if="err.practice_type === '字词默写' || err.practice_type === '词语搭配'">
              <div class="ex-instruction">{{ err.display?.mode?.instruction }}</div>
              <div class="ex-exercise" v-if="err.display?.exerciseText">
                {{ err.display.exerciseText }}
              </div>
              <div class="ex-hint" v-if="err.display?.exerciseHint">
                {{ err.display.exerciseHint }}
              </div>
            </template>

            <!-- 标点符号 -->
            <template v-else-if="err.practice_type === '标点符号'">
              <div class="ex-instruction">{{ err.display?.mode?.instruction }}</div>
              <div class="ex-exercise" v-if="err.display?.exerciseText">
                {{ err.display.exerciseText }}
              </div>
            </template>

            <!-- 修改病句 -->
            <template v-else-if="err.practice_type === '修改病句'">
              <div class="ex-instruction">下面的句子有问题，找出问题并修改：</div>
              <div class="ex-err-text">{{ err.error_text }}</div>
            </template>

            <!-- 其他 -->
            <template v-else>
              <div class="ex-err-text" v-if="err.error_text">{{ err.error_text }}</div>
            </template>

            <!-- 图片 -->
            <div class="ex-image" v-if="err.image_url">
              <img :src="err.image_url" alt="题目图示" @click="previewImage = err.image_url" />
            </div>

            <!-- 作答区 -->
            <div class="ex-blank">✍️ 作答区</div>

            <!-- 答案（显示答案时展示） -->
            <div class="ex-answer" v-show="showAnswers">
              <div class="exa-section exa-wrong" v-if="err.student_answer">
                <div class="exa-label-wrong">❌ 你写成了</div>
                <div class="exa-value-wrong">{{ err.student_answer }}</div>
              </div>
              <div class="exa-section exa-right">
                <div class="exa-label">✅ 正确答案</div>
                <div class="exa-content">{{ err.correct_text }}</div>
              </div>
              <div class="exa-section exa-analysis" v-if="err.analysis">
                <div class="exa-label">💡 解析</div>
                <div class="exa-content">{{ err.analysis }}</div>
              </div>
            </div>

          </div>
        </template>
      </div>
    </template>

    <!-- 图片预览弹窗 -->
    <Teleport to="body">
      <div class="image-preview" v-if="previewImage" @click="previewImage = null">
        <img :src="previewImage" alt="预览" @click.stop />
        <div class="ip-close" @click="previewImage = null">✕</div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'PrintView',
  setup() {
    const selectedPhase = ref(null)
    const paperData = ref(null)
    const showAnswers = ref(false)
    const downloading = ref(false)
    const previewImage = ref(null)

    const phaseDefs = [
      { key: '天天清', emoji: '🔴', name: '天天清', time: '10-15分钟', color: '#ef4444',
        desc: '当天错题当天订正，不分学科混合练习' },
      { key: '周周清', emoji: '🟠', name: '周周清', time: '30分钟', color: '#f97316',
        desc: '按学科分组，本周错题重做一遍' },
      { key: '单元清', emoji: '🟡', name: '单元清', time: '45-60分钟', color: '#eab308',
        desc: '按单元汇总，画出知识图谱' },
      { key: '期中清', emoji: '🔵', name: '期中清', time: '分2-3天', color: '#3b82f6',
        desc: '前半学期未掌握错题全面过一遍' },
      { key: '期末清', emoji: '🟢', name: '期末清', time: '分1周', color: '#22c55e',
        desc: '全学期错题终极扫荡' },
    ]

    async function selectPhase(key) {
      selectedPhase.value = key
      paperData.value = null
      showAnswers.value = false
      try {
        const res = await fetch(`/api/errors/paper?phase=${encodeURIComponent(key)}`)
        if (!res.ok) throw new Error('加载失败')
        paperData.value = await res.json()
      } catch(e) {
        console.error(e)
        alert('加载练习失败，请检查服务器连接')
      }
    }

    // 遮住标题里的正确答案（防止字词默写时答案暴露）
    function maskTitle(title, correctText) {
      if (!title || !correctText) return title || ''
      // 把标题里的正确答案替换成 [  ][  ]
      return title.replace(correctText, '（    ）')
    }

    function subjTag(s) {
      const map = { 语文: 'green', 数学: 'blue', 英语: 'pink', 科学: 'gray' }
      return map[s] || 'gray'
    }
    function catBg(c) {
      const map = { 字词: 'rgba(244,114,182,0.12)', 病句: 'rgba(251,146,60,0.12)', 标点: 'rgba(168,85,247,0.12)', 概念: 'rgba(96,165,250,0.12)' }
      return map[c] || 'rgba(148,163,184,0.12)'
    }
    function catColor(c) {
      const map = { 字词: '#f472b6', 病句: '#fb923c', 标点: '#a855f7', 概念: '#60a5fa' }
      return map[c] || '#94a3b8'
    }
    function groupIcon(name) {
      const map = { 语文: '📖', 数学: '🔢', 英语: '🔤', 科学: '🔬' }
      return map[name] || '📚'
    }

    async function downloadDocx() {
      downloading.value = true
      try {
        const res = await fetch(`/api/errors/download?phase=${encodeURIComponent(selectedPhase.value)}`)
        if (!res.ok) throw new Error('下载失败')
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `错题重练_${selectedPhase.value}.docx`
        a.click()
        URL.revokeObjectURL(url)
      } catch(e) {
        console.error(e)
        alert('下载失败，请重试')
      } finally {
        downloading.value = false
      }
    }

    return { selectedPhase, paperData, showAnswers, downloading, previewImage,
      phaseDefs, selectPhase, maskTitle, subjTag, catBg, catColor, groupIcon, downloadDocx }
  }
}
</script>

<style scoped>
.print-page { max-width: 800px; margin: 0 auto; padding: 20px 16px 60px; }

.print-controls { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
.pc-back { padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); color: var(--text); font-size: 14px; cursor: pointer; white-space: nowrap; }
.pc-title-area { flex: 1; }
.pc-title { font-size: 22px; font-weight: 800; color: var(--text); margin: 0; }
.pc-subtitle { font-size: 13px; color: var(--text2); margin: 4px 0 0; }

.phase-select { padding: 20px 0; }
.ps-intro { text-align: center; margin-bottom: 28px; }
.ps-intro h2 { font-size: 20px; font-weight: 800; color: var(--text); margin: 0 0 6px; }
.ps-intro p { font-size: 13px; color: var(--text2); margin: 0; }
.ps-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.ps-card {
  padding: 20px; border-radius: 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  cursor: pointer; transition: all 0.3s;
}
.ps-card:hover { transform: translateY(-2px); border-color: var(--pc); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
.psc-emoji { font-size: 32px; margin-bottom: 8px; }
.psc-name { font-size: 18px; font-weight: 800; color: var(--text); margin-bottom: 4px; }
.psc-time { font-size: 12px; color: var(--text2); margin-bottom: 8px; }
.psc-desc { font-size: 12px; color: var(--text3); line-height: 1.4; margin-bottom: 12px; }
.psc-action { font-size: 13px; font-weight: 700; color: var(--pc); }

.action-bar {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 16px; padding: 10px 14px;
  border-radius: 12px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  flex-wrap: wrap;
}
.ab-back { padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: var(--text2); font-size: 13px; cursor: pointer; white-space: nowrap; }
.ab-info { font-size: 13px; color: var(--text2); flex: 1; }
.ab-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ab-toggle { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px; color: var(--text2); user-select: none; }
.ab-toggle input { display: none; }
.toggle-track-sm { width: 36px; height: 20px; border-radius: 10px; background: rgba(255,255,255,0.08); position: relative; transition: 0.2s; }
.ab-toggle input:checked + .toggle-track-sm { background: var(--accent); }
.toggle-knob-sm { width: 16px; height: 16px; border-radius: 50%; background: white; position: absolute; top: 2px; left: 2px; transition: 0.2s; }
.ab-toggle input:checked + .toggle-track-sm .toggle-knob-sm { left: 18px; }
.ab-download { padding: 8px 16px; border-radius: 10px; border: none; background: var(--accent); color: white; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; }
.ab-download:disabled { opacity: 0.5; cursor: not-allowed; }

.pedagogy-box { padding: 16px 18px; border-radius: 14px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); margin-bottom: 16px; }
.pb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.pb-title { font-size: 16px; font-weight: 800; color: var(--accent); }
.pb-time { font-size: 12px; color: var(--text2); padding: 3px 10px; border-radius: 8px; background: rgba(255,255,255,0.04); }
.pb-desc { font-size: 13px; color: var(--text2); margin-bottom: 12px; line-height: 1.5; }
.pb-steps { display: flex; flex-direction: column; gap: 4px; }
.pb-step { font-size: 13px; color: var(--text); padding: 6px 10px; border-radius: 8px; background: rgba(255,255,255,0.02); }

.loading-state { text-align: center; padding: 80px 0; color: var(--text2); }
.ls-spinner { width: 32px; height: 32px; border: 3px solid rgba(255,255,255,0.06); border-top-color: var(--accent); border-radius: 50%; margin: 0 auto 12px; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.exercise-list { display: flex; flex-direction: column; gap: 16px; }

.ex-group-header {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 18px; margin-bottom: 4px;
  border-radius: 14px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
}
.exg-icon { font-size: 20px; }
.exg-name { font-size: 16px; font-weight: 800; color: var(--text); flex: 1; }
.exg-count { font-size: 12px; color: var(--text2); }

.ex-item {
  padding: 18px 20px;
  border-radius: 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  animation: slide-up 0.5s ease backwards;
}
@keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.ex-header { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
.ex-num { font-size: 11px; font-weight: 700; color: var(--text3); min-width: 24px; }
.ex-tag { font-size: 10px; padding: 2px 8px; border-radius: 6px; font-weight: 600; }
.tag-green { background: rgba(74,222,128,0.12); color: #4ade80; }
.tag-blue { background: rgba(96,165,250,0.12); color: #60a5fa; }
.tag-pink { background: rgba(244,114,182,0.12); color: #f472b6; }
.tag-gray { background: rgba(148,163,184,0.12); color: #94a3b8; }
.ex-tag-type {
  font-size: 10px; padding: 2px 8px; border-radius: 6px;
  background: rgba(139,92,246,0.12); color: #a78bfa; font-weight: 600;
}
.ex-cat { font-size: 10px; padding: 2px 8px; border-radius: 6px; font-weight: 600; }

/* ==== 标题：正常显示 ==== */
.ex-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 8px; }

.ex-instruction {
  font-size: 13px; font-weight: 700; color: #818cf8;
  margin-bottom: 10px; padding: 8px 12px;
  border-radius: 8px;
  background: rgba(129,140,248,0.06);
  border: 1px solid rgba(129,140,248,0.1);
}
.ex-exercise {
  font-size: 14px; color: var(--text);
  line-height: 1.8; margin-bottom: 8px;
  padding: 10px 14px; border-radius: 10px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
}
.ex-hint {
  font-size: 12px; color: var(--text3);
  margin-bottom: 12px; font-style: italic;
}
.ex-err-text {
  font-size: 14px; color: var(--text2);
  line-height: 1.6; margin-bottom: 12px;
  padding: 10px 14px; border-radius: 10px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
}
.ex-blank {
  font-size: 12px; color: var(--text3);
  min-height: 64px;
  border: 1px dashed rgba(255,255,255,0.08);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 12px;
}
.ex-answer {
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(74,222,128,0.02);
  border: 1px solid rgba(74,222,128,0.08);
  animation: fadeIn 0.3s ease;
  display: flex; flex-direction: column; gap: 10px;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.exa-label { font-size: 11px; font-weight: 700; color: #4ade80; margin-bottom: 4px; }
.exa-label-wrong { font-size: 11px; font-weight: 700; color: #f87171; margin-bottom: 4px; }
.exa-value-wrong { font-size: 14px; color: #f87171; line-height: 1.6; }
.exa-content { font-size: 14px; color: var(--accent); line-height: 1.6; white-space: pre-wrap; }
.exa-analysis { margin-top: 4px; padding-top: 10px; border-top: 1px solid rgba(74,222,128,0.06); }
.exa-analysis .exa-content { color: var(--text2); font-size: 13px; }

.ex-image { margin-bottom: 10px; border-radius: 10px; overflow: hidden; cursor: pointer; border: 1px solid rgba(255,255,255,0.06); }
.ex-image img { width: 100%; max-height: 300px; object-fit: contain; display: block; background: rgba(255,255,255,0.02); }

.image-preview {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.85);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.image-preview img { max-width: 90%; max-height: 90%; object-fit: contain; cursor: default; }
.ip-close {
  position: absolute; top: 20px; right: 20px;
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; color: white; cursor: pointer;
}

@media print {
  .no-print { display: none !important; }
  .print-page { max-width: 100%; padding: 0; }
  .ex-item, .ex-group-header, .pedagogy-box { background: white; border-color: #eee; }
  .ex-title { color: #111; }
  .ex-err-text, .exa-content { color: #333; }
  .ex-answer { border-color: #bbf7d0; }
  .exa-label { color: #16a34a; }
  .exa-analysis { color: #666; }
}

@media (max-width: 600px) {
  .ps-grid { grid-template-columns: 1fr; }
}
</style>
