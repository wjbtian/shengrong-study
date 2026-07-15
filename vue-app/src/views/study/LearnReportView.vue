<template>
  <div class="report-page">
    <!-- ===== 返回按钮 ===== -->
    <div class="report-header">
      <button class="rh-back" @click="$router.push('/study')">← 返回学习中心</button>
    </div>

    <!-- 加载 -->
    <div class="loading-state" v-if="!dataLoaded">
      <div class="ls-spinner"></div>
      <p>正在生成学习报告...</p>
    </div>

    <template v-if="dataLoaded">
      <!-- ===== 封面 ===== -->
      <div class="cover-section">
        <div class="cover-badge">一 生 一 案</div>
        <div class="cover-title">学习总结报告</div>
        <div class="cover-subtitle">五年级上学期 · 个人专属</div>
        <div class="cover-divider"></div>
        <div class="cover-stats">
          <div class="cs-item">
            <span class="cs-num">{{ stats.total || 0 }}</span>
            <span class="cs-label">总记录</span>
          </div>
          <div class="cs-item">
            <span class="cs-num" v-for="s in (stats.bySubject || []).slice(0,3)" :key="s.subject" style="font-size:18px;display:inline;margin:0 4px;">
              <span :class="'tag-sm tag-' + subjClass(s.subject)">{{ s.subject }}{{ s.count }}</span>
            </span>
          </div>
          <div class="cs-item">
            <span class="cs-num">{{ errorTypes }}</span>
            <span class="cs-label">错误类型</span>
          </div>
          <div class="cs-item">
            <span class="cs-num" style="color:#f87171;">{{ unmastered }}</span>
            <span class="cs-label">待攻克</span>
          </div>
        </div>
        <div class="cover-date">{{ reportDate }} · AI 学习助手生成</div>
        <div class="cover-motto">
          "把每一次错误都当作宝贵的财富，<br>把每一次订正都当作进步的阶梯。"
        </div>
      </div>

      <!-- ===== 五阶复习链 ===== -->
      <div class="report-card">
        <h2 class="rc-title">🔄 五阶复习进度</h2>
        <p class="rc-desc">当前处于「🔴 天天清」阶段，完成每日订正后自动进入下一阶</p>
        <div class="phase-chain">
          <div class="pi active" style="--pc:#ef4444;">
            <span class="pi-emoji">🔴</span>
            <span class="pi-name">天天清</span>
            <span class="pi-status">当前</span>
          </div>
          <div class="pi-arrow">→</div>
          <div class="pi" style="--pc:#f97316;">
            <span class="pi-emoji">🟠</span>
            <span class="pi-name">周周清</span>
          </div>
          <div class="pi-arrow">→</div>
          <div class="pi" style="--pc:#eab308;">
            <span class="pi-emoji">🟡</span>
            <span class="pi-name">单元清</span>
          </div>
          <div class="pi-arrow">→</div>
          <div class="pi" style="--pc:#3b82f6;">
            <span class="pi-emoji">🔵</span>
            <span class="pi-name">期中清</span>
          </div>
          <div class="pi-arrow">→</div>
          <div class="pi" style="--pc:#22c55e;">
            <span class="pi-emoji">🟢</span>
            <span class="pi-name">期末清</span>
          </div>
        </div>
      </div>

      <!-- ===== 概况 ===== -->
      <div class="report-card">
        <h2 class="rc-title">📊 掌握概览</h2>
        <p class="rc-desc">各学科错题分布与掌握程度</p>
        <div class="mastery-bar" v-for="m in (stats.byMastery || [])" :key="m.mastery">
          <span class="mb-label">{{ m.mastery }}</span>
          <div class="mb-track">
            <div class="mb-fill" :style="{ width: pct(m.count) + '%', background: masteryColor(m.mastery) }"></div>
          </div>
          <span class="mb-num">{{ m.count }}</span>
        </div>
        <div class="subject-breakdown" v-if="(stats.bySubject || []).length">
          <span class="sb-label">学科分布：</span>
          <span v-for="s in stats.bySubject" :key="s.subject" class="sb-tag" :class="'tag-' + subjClass(s.subject)">{{ s.subject }} {{ s.count }}题</span>
        </div>
      </div>

      <!-- ===== 作文批阅 ===== -->
      <div class="report-card essay-card" v-if="essayReport">
        <h2 class="rc-title">📖 作文批阅</h2>
        <p class="rc-desc">《我最推荐的一本书》 · 2026-07-14 · {{ essayReport.errors.length }} 处待改进</p>

        <div class="summary-box">
          从作文可以看出，孩子有清晰的结构意识（开头引用→介绍书籍→具体情节→读后感悟），已经是一篇"合格"的作文。下面的分析帮你从"合格"走向"优秀"。
        </div>

        <div class="score-row">
          <div class="score-item" v-for="s in essayReport.scores" :key="s.name">
            <span class="score-label">{{ s.name }}</span>
            <span class="score-stars" v-html="stars(s.score)"></span>
          </div>
        </div>

        <div class="errors-list">
          <div class="err-item" v-for="(e, i) in essayReport.errors" :key="i">
            <span class="err-tag" :class="'tag-' + e.type">{{ e.typeLabel }}</span>
            <div class="err-body">
              <div class="err-orig">❌ <strong>原文：</strong>{{ e.orig }}</div>
              <div class="err-fix" v-if="e.fix">✅ <strong>修改：</strong>{{ e.fix }}</div>
              <div class="err-note" v-if="e.note">💡 {{ e.note }}</div>
            </div>
          </div>
        </div>

        <!-- 四大提升方向 -->
        <h3 style="margin:20px 0 12px;font-size:15px;color:var(--text);">📌 四大提升方向</h3>
        <div class="tips-grid">
          <div class="tip-card">
            <div class="tip-icon">①</div>
            <h3>写完读一遍</h3>
            <p>用"出声朗读法"——写好后再从头到尾读一遍。不通顺的地方自己就能发现。</p>
          </div>
          <div class="tip-card">
            <div class="tip-icon">②</div>
            <h3>好词好句本</h3>
            <p>准备小本子，读到好词好句就记下来。"火眼金睛""神通广大"要多积累。</p>
          </div>
          <div class="tip-card">
            <div class="tip-icon">③</div>
            <h3>专属感结尾</h3>
            <p>不要用"万能结尾"。问自己：这本书最特别的地方是什么？把那个写出来。</p>
          </div>
          <div class="tip-card">
            <div class="tip-icon">④</div>
            <h3>多练基本功</h3>
            <p>每周听写一次易错词语，"轻言放弃""坚持不懈"这些都要过关。</p>
          </div>
        </div>
      </div>

      <!-- ===== 数学错题分析 ===== -->
      <div class="report-card" v-if="mathErrors.length">
        <h2 class="rc-title">🔢 数学 · 几何概念专项</h2>
        <p class="rc-desc">共有 {{ mathErrors.length }} 道几何相关错题待巩固</p>

        <div class="summary-box info">
          <strong>核心方法：几何画图法</strong><br>
          数学几何题不要光想——<strong>先画图</strong>。标出已知条件，答案往往就出来了。平行四边形的高必须垂直于对应的底，高不能大于它所垂直的那条边的长度。
        </div>

        <div class="errors-list">
          <div class="err-item" v-for="e in mathErrors" :key="e.id">
            <span class="err-tag tag-geometry">几何</span>
            <div class="err-body">
              <div class="err-orig" v-if="e.title">📝 <strong>题目：</strong>{{ e.title }}</div>
              <div class="err-orig" v-if="e.error_text">📝 <strong>题目：</strong>{{ e.error_text }}</div>
              <div class="err-orig" v-if="e.student_answer">❌ <strong>你的作答：</strong><span style="color:#f87171;text-decoration:line-through;">{{ e.student_answer }}</span></div>
              <div class="err-fix" v-if="e.correct_text">✅ <strong>正确答案：</strong>{{ e.correct_text }}</div>
              <div class="err-note" v-if="e.analysis">💡 {{ e.analysis }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 所有错题汇总 ===== -->
      <div class="report-card" v-if="allErrors.length">
        <h2 class="rc-title">📋 全部错题汇总</h2>
        <p class="rc-desc">按学科分类，共 {{ allErrors.length }} 条记录</p>
        <div v-for="subj in groupedErrors" :key="subj.name" style="margin-bottom:16px;">
          <h3 style="font-size:14px;color:var(--text);margin-bottom:8px;">
            <span class="err-tag" :class="'tag-' + subjClass(subj.name)" style="font-size:12px;">{{ subj.name }}</span>
            <span style="font-size:13px;color:var(--text2);font-weight:400;">（{{ subj.items.length }} 题）</span>
          </h3>
          <div class="errors-list">
            <div class="err-item" v-for="e in subj.items" :key="e.id">
              <span class="err-tag" :class="'tag-' + catClass(e)">{{ e.category || '其他' }}</span>
              <div class="err-body">
                <div class="err-orig" v-if="e.error_text">📝 {{ e.error_text }}</div>
                <div class="err-orig" v-if="e.student_answer">❌ <span style="color:#f87171;">{{ e.student_answer }}</span></div>
                <div class="err-fix" v-if="e.correct_text">✅ {{ e.correct_text }}</div>
                <div class="err-note" v-if="e.analysis">💡 {{ e.analysis }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 学习方法 ===== -->
      <div class="report-card">
        <h2 class="rc-title">🧠 高效学习方法</h2>
        <p class="rc-desc">掌握这些方法，让学习事半功倍</p>

        <div class="methods-grid">
          <div class="method-card">
            <div class="mc-icon">🔄</div>
            <h3>错题三步骤</h3>
            <p>① 不看答案先自己做<br>② 做完对照批改<br>③ 能讲清楚为什么错才算过关</p>
          </div>
          <div class="method-card">
            <div class="mc-icon">🗣️</div>
            <h3>费曼学习法</h3>
            <p>假装你要把这个知识点教给一个完全不懂的人。讲不清楚，说明还没真正掌握。</p>
          </div>
          <div class="method-card">
            <div class="mc-icon">📐</div>
            <h3>几何画图法</h3>
            <p>几何题不要光想——先画图。标出已知条件，答案往往就出来了。</p>
          </div>
          <div class="method-card">
            <div class="mc-icon">📝</div>
            <h3>出声朗读法</h3>
            <p>写完作业/作文后读一遍，不通顺、有错误的地方自己就能发现。</p>
          </div>
          <div class="method-card">
            <div class="mc-icon">🧩</div>
            <h3>费曼技巧进阶</h3>
            <p>用类比解释抽象概念。比如"平行四边形的高"就像"楼层高度"——必须垂直量。</p>
          </div>
          <div class="method-card">
            <div class="mc-icon">⏰</div>
            <h3>间隔重复法</h3>
            <p>错题当天清 → 周末清 → 月底清。每次隔一段时间再做，效果最好。</p>
          </div>
        </div>
      </div>

      <!-- ===== 推荐阅读 ===== -->
      <div class="report-card">
        <h2 class="rc-title">📚 推荐阅读</h2>
        <p class="rc-desc">课外阅读是学好语文的最好老师</p>
        <div class="reading-list">
          <div class="reading-item">
            <span class="ri-icon">📕</span>
            <div>
              <strong>《西游记》青少版</strong>
              <p>感受原著语言，积累好词好句</p>
            </div>
          </div>
          <div class="reading-item">
            <span class="ri-icon">📕</span>
            <div>
              <strong>《草房子》（曹文轩）</strong>
              <p>学习如何把人物写得活灵活现</p>
            </div>
          </div>
          <div class="reading-item">
            <span class="ri-icon">📕</span>
            <div>
              <strong>《作文里的奇案》</strong>
              <p>换个角度看写作，激发写作兴趣</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 本周计划 ===== -->
      <div class="report-card">
        <h2 class="rc-title">🎯 本周学习计划</h2>
        <p class="rc-desc">基于本期报告反映的问题，重点攻克字词基本功和句子通顺度</p>

        <div class="plan-list">
          <div class="plan-item" v-for="(p, i) in weeklyPlan" :key="i">
            <span class="plan-day">{{ p.day }}</span>
            <span class="plan-task">{{ p.task }}</span>
            <span class="plan-tag" :class="'tag-' + subjClass(p.subject)">{{ p.subject }}</span>
          </div>
        </div>

        <h3 style="font-size:14px;color:var(--text);margin-top:20px;">📌 错题复习方法</h3>

        <div class="tip-box">
          <div class="tip-box-icon">🔄</div>
          <div>
            <strong>错题三步骤</strong><br>
            ① 不看答案，先自己做一遍<br>
            ② 做完对照正确答案批改<br>
            ③ 能用自己的话讲清楚为什么错，才算过关
          </div>
        </div>
        <div class="tip-box info">
          <div class="tip-box-icon">🗣️</div>
          <div>
            <strong>费曼学习法</strong><br>
            假装你要把这个知识点教给一个完全不懂的人。如果你讲不清楚，说明你还没真正掌握。
          </div>
        </div>
        <div class="tip-box info">
          <div class="tip-box-icon">📐</div>
          <div>
            <strong>几何画图法</strong><br>
            数学几何题不要光想——<strong>先画图</strong>。标出已知条件，答案往往就出来了。
          </div>
        </div>
      </div>

      <!-- ===== 页脚 ===== -->
      <div class="report-footer">
        <div class="footer-quote">
          "把每一次错误都当作宝贵的财富，<br>
          把每一次订正都当作进步的阶梯。"
        </div>
        <div class="footer-note">
          本报告由 AI 学习助手自动生成 · 错题数据同步至 Notion 知识库 · 可下载打印
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { api } from '../../utils/api'

export default {
  name: 'LearnReportView',
  setup() {
    const stats = ref({})
    const allErrors = ref([])
    const dataLoaded = ref(false)

    const reportDate = computed(() => {
      const d = new Date()
      return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`
    })

    const unmastered = computed(() => {
      const m = stats.value.byMastery || []
      const u = m.find(x => x.mastery.includes('未掌握'))
      return u ? u.count : 0
    })

    const errorTypes = computed(() => {
      return (stats.value.byCategory || []).length
    })

    const essayReport = computed(() => ({
      scores: [
        { name: '结构完整', score: 4 },
        { name: '语言表达', score: 3 },
        { name: '字词准确', score: 2 },
        { name: '结尾立意', score: 3 },
      ],
      errors: [
        { type: 'char', typeLabel: '字词', orig: '火眼睛金 → 应写火眼金睛', fix: '火眼金睛（固定成语：火中炼就的眼 + 金色眼球）', note: '"火眼金睛"是《西游记》专有成语，指孙悟空的识妖能力' },
        { type: 'char', typeLabel: '字词', orig: '轻言轻弃 → 应写轻言放弃', fix: '轻言放弃', note: '"轻言"是轻易地说，"放弃"是固定搭配，不能写成"轻弃"' },
        { type: 'char', typeLabel: '字词', orig: '本领高 → 应写本领高强', fix: '本领高强', note: '四字成语搭配，与"机智勇敢"形成对仗，读起来更有节奏感' },
        { type: 'char', typeLabel: '字词', orig: '心很善良 → 应写心地善良', fix: '心地善良', note: '"心地"是固定名词，指内心的品质，不能写成"心很"' },
        { type: 'sent', typeLabel: '病句', orig: '缺主语 — "是四大名著之一"前面缺少主语"它"', fix: '在"是四大名著之一"前加"它"，完整句子是"它是我国四大名著之一"', note: '每句话都要有主语，不能省略' },
        { type: 'sent', typeLabel: '病句', orig: '缺转折词 — "当师父被抓走了，他依然回来相救"前后缺转折关系', fix: '改为"但当师父被抓走后，他依然回来相救"，加"但"表转折', note: '前后意思转折的地方，要用"但""可是""然而"等转折词' },
        { type: 'sent', typeLabel: '病句', orig: '表述别扭 — "一直不说回高老庄的话"表达不够自然', fix: '建议改为"再也没有提过回高老庄"，表达更流畅', note: '书面语要用更规范、自然的表达方式' },
        { type: 'punct', typeLabel: '标点', orig: '全文一逗到底，缺句号', fix: '一个完整的意思说完了就加句号。原文应在"取经的故事""妖魔""话"等处加句号', note: '句号是"一句话说完了"的标志，学会用句号断句是写作的基本功' },
      ]
    }))

    const mathErrors = computed(() =>
      allErrors.value.filter(e => e.subject === '数学')
    )

    const groupedErrors = computed(() => {
      const groups = {}
      const order = ['语文', '数学', '英语']
      for (const e of allErrors.value) {
        const s = e.subject || '其他'
        if (!groups[s]) groups[s] = { name: s, items: [] }
        groups[s].items.push(e)
      }
      return order.filter(s => groups[s]).map(s => groups[s])
    })

    const weeklyPlan = [
      { day: '周一', task: '📝 抄写修改版范文，对比原文圈出所有改动处', subject: '语文' },
      { day: '周二', task: '📖 读《西游记》"三打白骨精"原文，摘抄 5 个好词 + 3 个好句', subject: '语文' },
      { day: '周二', task: '📐 平行四边形画图练习 3 道（画图→标注→验证）', subject: '数学' },
      { day: '周三', task: '✏️ 重写《我最推荐的一本书》，重点改好结尾', subject: '语文' },
      { day: '周四', task: '📝 听写易错词：火眼金睛、轻言放弃、坚持不懈、心地善良、本领高强', subject: '语文' },
      { day: '周五', task: '📖 读一篇优秀范文，用思维导图画出它的结构', subject: '语文' },
      { day: '周末', task: '🔄 周周清：本周所有错题重做一遍（按学科分组）', subject: '综合' },
    ]

    function stars(n) {
      return '★'.repeat(n) + '☆'.repeat(5 - n)
    }

    function pct(count) {
      const total = stats.value.total || 1
      return Math.round(count / total * 100)
    }

    function masteryColor(m) {
      if (m.includes('未掌握')) return '#ef4444'
      if (m.includes('复习中')) return '#3b82f6'
      if (m.includes('已掌握')) return '#22c55e'
      return '#888'
    }

    function subjClass(s) {
      const map = { 语文: 'chinese', 数学: 'math', 英语: 'english', 综合: 'all' }
      return map[s] || ''
    }

    function catClass(e) {
      const cat = (e.category || '').toLowerCase()
      if (cat.includes('字词') || cat.includes('拼音')) return 'char'
      if (cat.includes('病句') || cat.includes('句子')) return 'sent'
      if (cat.includes('标点')) return 'punct'
      if (cat.includes('几何') || cat.includes('图形')) return 'geometry'
      return 'default'
    }

    onMounted(async () => {
      try {
        const [s, e] = await Promise.all([
          api('GET', '/errors/stats'),
          api('GET', '/errors')
        ])
        stats.value = s || {}
        allErrors.value = Array.isArray(e) ? e : []
      } catch(ex) {
        console.error('加载报告数据失败:', ex)
      }
      dataLoaded.value = true
    })

    return {
      stats, allErrors, dataLoaded, reportDate, unmastered, errorTypes,
      essayReport, mathErrors, groupedErrors, weeklyPlan,
      stars, pct, masteryColor, subjClass, catClass
    }
  }
}
</script>

<style scoped>
/* ===== 基础容器 ===== */
.report-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 20px 16px 60px;
}

/* ===== 加载状态 ===== */
.loading-state { text-align: center; padding: 100px 0; color: var(--text2); }
.ls-spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.06); border-top-color: var(--accent); border-radius: 50%; margin: 0 auto 14px; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== 返回按钮 ===== */
.report-header { margin-bottom: 24px; }
.rh-back { padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); color: var(--text); font-size: 14px; cursor: pointer; transition: all 0.2s; }
.rh-back:hover { background: rgba(255,255,255,0.06); }

/* ===== 封面 ===== */
.cover-section {
  text-align: center;
  padding: 70px 30px 50px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 16px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}
.cover-section::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(circle at 30% 40%, rgba(233,69,96,0.06) 0%, transparent 60%);
  pointer-events: none;
}
.cover-badge {
  display: inline-block;
  background: #e94560;
  color: #fff;
  padding: 5px 24px;
  border-radius: 20px;
  font-size: 12px;
  letter-spacing: 4px;
  margin-bottom: 30px;
}
.cover-title {
  font-size: 38px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 8px;
  line-height: 1.3;
}
.cover-subtitle {
  font-size: 18px;
  color: rgba(255,255,255,0.6);
  margin-top: 10px;
  letter-spacing: 6px;
}
.cover-divider {
  width: 80px;
  height: 4px;
  background: #e94560;
  margin: 28px auto;
  border: none;
  border-radius: 2px;
}
.cover-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 20px 0;
}
.cs-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cs-num { font-size: 30px; font-weight: 800; color: #fff; }
.cs-label { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 2px; }
.tag-sm {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}
.cover-date {
  font-size: 13px;
  color: rgba(255,255,255,0.3);
  margin-top: 20px;
}
.cover-motto {
  margin-top: 30px;
  font-size: 15px;
  color: rgba(255,255,255,0.4);
  font-style: italic;
  letter-spacing: 2px;
  line-height: 1.8;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 24px;
}

/* ===== 卡片 ===== */
.report-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 16px;
  padding: 22px 26px;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}
.report-card:hover { border-color: rgba(255,255,255,0.07); }
.rc-title { font-size: 18px; font-weight: 700; color: var(--text); margin: 0 0 4px; letter-spacing: 0.5px; }
.rc-desc { font-size: 13px; color: var(--text2); margin: 0 0 20px; }

/* ===== 五阶复习链 ===== */
.phase-chain {
  display: flex; align-items: center; gap: 6px;
  flex-wrap: wrap; justify-content: center;
}
.pi {
  display: flex; flex-direction: column; align-items: center;
  padding: 10px 16px; border-radius: 12px;
  border: 2px solid transparent;
  min-width: 76px;
  transition: all 0.2s;
}
.pi.active {
  border-color: var(--pc);
  background: rgba(255,255,255,0.03);
  box-shadow: 0 0 20px rgba(var(--pc), 0.05);
}
.pi-emoji { font-size: 24px; }
.pi-name { font-size: 13px; font-weight: 700; color: var(--text); margin-top: 4px; }
.pi-status { font-size: 10px; color: var(--pc); font-weight: 600; margin-top: 2px; }
.pi-arrow { color: var(--text3); font-size: 18px; }

/* ===== 掌握程度 ===== */
.mastery-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.mb-label { font-size: 13px; color: var(--text2); min-width: 80px; }
.mb-track { flex: 1; height: 10px; border-radius: 5px; background: rgba(255,255,255,0.04); overflow: hidden; }
.mb-fill { height: 100%; border-radius: 5px; transition: width 0.6s ease; }
.mb-num { font-size: 13px; color: var(--text2); min-width: 30px; text-align: right; }

.subject-breakdown { margin-top: 16px; display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.sb-label { font-size: 13px; color: var(--text2); }
.sb-tag {
  display: inline-block; padding: 2px 10px; border-radius: 12px;
  font-size: 12px; font-weight: 600;
}

/* ===== 评分行 ===== */
.score-row { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.score-item { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 80px; }
.score-label { font-size: 13px; color: var(--text2); margin-bottom: 4px; }
.score-stars { font-size: 18px; color: #f59e0b; letter-spacing: 2px; }

/* ===== 摘要框 ===== */
.summary-box {
  background: rgba(245,158,11,0.06);
  border-left: 4px solid #f59e0b;
  padding: 14px 18px;
  margin-bottom: 16px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.8;
}
.summary-box.info {
  background: rgba(59,130,246,0.06);
  border-left-color: #3b82f6;
}

/* ===== 错误列表 ===== */
.errors-list { display: flex; flex-direction: column; gap: 8px; }
.err-item {
  display: flex; gap: 12px;
  padding: 14px 16px; border-radius: 10px;
  background: rgba(255,255,255,0.01);
  border: 1px solid rgba(255,255,255,0.04);
  transition: border-color 0.2s;
}
.err-item:hover { border-color: rgba(255,255,255,0.08); }
.err-tag {
  flex-shrink: 0; padding: 3px 10px; border-radius: 6px;
  font-size: 11px; font-weight: 700; height: fit-content;
}
.tag-char { background: rgba(244,114,182,0.15); color: #f472b6; }
.tag-sent { background: rgba(251,146,60,0.15); color: #fb923c; }
.tag-punct { background: rgba(168,85,247,0.15); color: #a855f7; }
.tag-geometry { background: rgba(96,165,250,0.15); color: #60a5fa; }
.tag-chinese { background: rgba(74,222,80,0.12); color: #4ade80; }
.tag-math { background: rgba(96,165,250,0.12); color: #60a5fa; }
.tag-english { background: rgba(244,114,182,0.12); color: #f472b6; }
.tag-all { background: rgba(168,85,247,0.12); color: #a855f7; }
.tag-default { background: rgba(255,255,255,0.04); color: var(--text2); }

.err-body { flex: 1; min-width: 0; }
.err-orig { font-size: 13px; color: var(--text2); line-height: 1.7; }
.err-fix { font-size: 13px; color: #4ade80; margin-top: 4px; line-height: 1.6; }
.err-note { font-size: 12px; color: var(--text3); margin-top: 4px; font-style: italic; line-height: 1.6; }

/* ===== 学习建议网格 ===== */
.tips-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 10px; }
.tip-card {
  padding: 18px; border-radius: 12px;
  background: rgba(255,255,255,0.01);
  border: 1px solid rgba(255,255,255,0.04);
  transition: all 0.2s;
}
.tip-card:hover {
  background: rgba(255,255,255,0.03);
  border-color: rgba(255,255,255,0.08);
}
.tip-icon { font-size: 28px; margin-bottom: 8px; }
.tip-card h3 { font-size: 14px; font-weight: 700; color: var(--text); margin: 0 0 6px; }
.tip-card p { font-size: 13px; color: var(--text2); margin: 0; line-height: 1.7; }

/* ===== 学习方法网格 ===== */
.methods-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.method-card {
  padding: 20px; border-radius: 12px;
  background: rgba(255,255,255,0.01);
  border: 1px solid rgba(255,255,255,0.04);
  transition: all 0.2s;
}
.method-card:hover {
  background: rgba(255,255,255,0.03);
  border-color: rgba(255,255,255,0.08);
}
.mc-icon { font-size: 32px; margin-bottom: 10px; }
.method-card h3 { font-size: 15px; font-weight: 700; color: var(--text); margin: 0 0 8px; }
.method-card p { font-size: 13px; color: var(--text2); margin: 0; line-height: 1.8; }

/* ===== 推荐阅读 ===== */
.reading-list { display: flex; flex-direction: column; gap: 10px; }
.reading-item {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px; border-radius: 12px;
  background: rgba(255,255,255,0.01);
  border: 1px solid rgba(255,255,255,0.04);
  transition: all 0.2s;
}
.reading-item:hover {
  background: rgba(255,255,255,0.03);
}
.ri-icon { font-size: 28px; flex-shrink: 0; }
.reading-item strong { font-size: 14px; color: var(--text); display: block; margin-bottom: 2px; }
.reading-item p { font-size: 13px; color: var(--text2); margin: 0; }

/* ===== 本周计划 ===== */
.plan-list { display: flex; flex-direction: column; gap: 6px; }
.plan-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 16px; border-radius: 10px;
  background: rgba(255,255,255,0.01);
  border: 1px solid rgba(255,255,255,0.03);
  transition: all 0.2s;
}
.plan-item:hover { background: rgba(255,255,255,0.03); }
.plan-day {
  font-size: 12px; font-weight: 700; color: var(--text3);
  min-width: 36px; text-align: center;
}
.plan-task { flex: 1; font-size: 13px; color: var(--text); line-height: 1.5; }
.plan-tag {
  font-size: 10px; padding: 2px 10px; border-radius: 6px; font-weight: 600;
  white-space: nowrap;
}

/* ===== 提示框 ===== */
.tip-box {
  display: flex; gap: 12px;
  padding: 14px 18px;
  margin-top: 10px;
  background: rgba(34,197,94,0.04);
  border: 1px solid rgba(34,197,94,0.08);
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.8;
}
.tip-box.info {
  background: rgba(59,130,246,0.04);
  border-color: rgba(59,130,246,0.08);
}
.tip-box-icon { font-size: 24px; flex-shrink: 0; }

/* ===== 页脚 ===== */
.report-footer {
  text-align: center;
  padding: 40px 20px;
  border-top: 1px solid rgba(255,255,255,0.04);
  margin-top: 10px;
}
.footer-quote {
  font-size: 18px;
  color: var(--accent);
  font-weight: 600;
  letter-spacing: 2px;
  line-height: 1.8;
  margin-bottom: 16px;
}
.footer-note {
  font-size: 12px;
  color: var(--text3);
}

/* ===== 响应式 ===== */
@media (max-width: 640px) {
  .cover-title { font-size: 26px; letter-spacing: 4px; }
  .cover-stats { gap: 16px; }
  .cs-num { font-size: 24px; }
  .phase-chain { gap: 2px; }
  .pi { min-width: 58px; padding: 8px 10px; }
  .pi-emoji { font-size: 20px; }
  .pi-arrow { font-size: 14px; }
  .score-row { gap: 8px; }
  .report-card { padding: 16px 18px; }
  .tips-grid { grid-template-columns: repeat(2, 1fr); }
  .methods-grid { grid-template-columns: 1fr; }
}
</style>
