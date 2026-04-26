<template>
  <div class="olympiad-view">
    <!-- 顶部英雄区 -->
    <section class="subject-hero">
      <div class="subject-hero-main">
        <div class="subject-hero-icon">🧠</div>
        <div class="subject-hero-info">
          <h1 class="subject-hero-title">奥数挑战</h1>
          <p class="subject-hero-subtitle">七大专题 · 20个知识点 · 锻炼逻辑思维</p>
        </div>
      </div>
      <div class="subject-hero-progress">
        <div class="progress-ring-wrap">
          <svg viewBox="0 0 120 120" class="progress-ring">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
            <circle cx="60" cy="60" r="54" fill="none" stroke="#fbbf24" stroke-width="8"
              :stroke-dasharray="339.292"
              :stroke-dashoffset="339.292 - (339.292 * progressPercent / 100)"
              stroke-linecap="round"/>
          </svg>
          <div class="progress-ring-text">
            <div class="progress-percent">{{ progressPercent }}%</div>
          </div>
        </div>
        <div class="progress-count">{{ doneCount }} / 20 专题</div>
      </div>
    </section>

    <!-- 专题地图 -->
    <section class="topics-section">
      <div class="section-header">
        <h2 class="section-title">🗺️ 专题地图</h2>
        <span class="section-subtitle">点击专题查看解题方法和例题</span>
      </div>
      <div class="topics-timeline">
        <div
          v-for="(topic, idx) in topics"
          :key="topic.id"
          class="topic-item"
          :class="{ completed: topic.completed, active: selectedTopic?.id === topic.id }"
          @click="selectTopic(topic)"
        >
          <div class="topic-marker">
            <span v-if="topic.completed" class="topic-check">✓</span>
            <span v-else class="topic-num">{{ idx + 1 }}</span>
          </div>
          <div class="topic-info">
            <h4 class="topic-title">{{ topic.title }}</h4>
            <p class="topic-desc">{{ topic.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 专题详情 -->
    <section v-if="selectedTopic" class="topic-detail-section">
      <div class="section-header">
        <h2 class="section-title">📖 {{ selectedTopic.title }}</h2>
        <button class="btn-text" @click="selectedTopic = null">关闭 ✕</button>
      </div>
      <div class="topic-detail-content">
        <div class="detail-block">
          <h4>📝 知识点</h4>
          <p>{{ selectedTopic.knowledge }}</p>
        </div>
        <div class="detail-block">
          <h4>🔧 解题方法</h4>
          <p>{{ selectedTopic.method }}</p>
        </div>
        <div class="detail-block">
          <h4>🎯 例题</h4>
          <div class="example-box">
            <p class="example-q"><strong>题目：</strong>{{ selectedTopic.example.q }}</p>
            <p class="example-a"><strong>解答：</strong>{{ selectedTopic.example.a }}</p>
          </div>
        </div>
        <div class="detail-block">
          <h4>💡 解题步骤</h4>
          <ol class="steps-list">
            <li v-for="(step, i) in selectedTopic.steps" :key="i">{{ step }}</li>
          </ol>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProgress } from '../utils/api.js'

const progress = ref({})
const selectedTopic = ref(null)

const topics = ref([
  { id: 'om_1_1', title: '和差问题', desc: '已知两数的和与差，求这两个数', completed: false, knowledge: '和差问题的基本公式', method: '（和+差）÷2=大数，（和-差）÷2=小数', example: { q: '甲乙两数和为100，差为20，求两数。', a: '大数=(100+20)÷2=60，小数=(100-20)÷2=40' }, steps: ['理解题意，找出和与差', '判断求大数还是小数', '套用公式计算', '验证答案'] },
  { id: 'om_1_2', title: '和倍问题', desc: '已知两数的和与倍数关系', completed: false, knowledge: '和倍问题的基本公式', method: '和÷（倍数+1）=小数，小数×倍数=大数', example: { q: '甲乙两数和为120，甲是乙的3倍，求两数。', a: '乙=120÷(3+1)=30，甲=30×3=90' }, steps: ['找出和与倍数关系', '画线段图帮助理解', '计算1倍数', '求出多倍数'] },
  { id: 'om_1_3', title: '差倍问题', desc: '已知两数的差与倍数关系', completed: false, knowledge: '差倍问题的基本公式', method: '差÷（倍数-1）=小数，小数×倍数=大数', example: { q: '甲比乙大40，甲是乙的3倍，求两数。', a: '乙=40÷(3-1)=20，甲=20×3=60' }, steps: ['找出差与倍数关系', '理解差是几倍数', '计算1倍数', '求出多倍数'] },
  { id: 'om_2_1', title: '年龄问题', desc: '利用年龄差不变解题', completed: false, knowledge: '年龄差永远不变', method: '抓住年龄差不变的特点，转化为和差倍问题', example: { q: '爸爸今年35岁，儿子5岁，几年后爸爸年龄是儿子的3倍？', a: '年龄差=30岁，那时儿子=30÷(3-1)=15岁，所以10年后' }, steps: ['确定今年年龄', '计算年龄差', '根据倍数关系列式', '求解并验证'] },
  { id: 'om_2_2', title: '植树问题', desc: '线段上的点数与段数关系', completed: false, knowledge: '点数与段数的关系', method: '两端都植：棵数=段数+1；一端植：棵数=段数；两端不植：棵数=段数-1', example: { q: '一条100米的路，每隔5米种一棵树，两端都种，共种几棵？', a: '段数=100÷5=20，棵数=20+1=21棵' }, steps: ['确定总长度', '计算段数', '判断植树方式', '计算棵数'] },
  { id: 'om_3_1', title: '鸡兔同笼', desc: '经典的假设法应用', completed: false, knowledge: '假设法的基本思想', method: '假设全是鸡或全是兔，通过脚数差求解', example: { q: '鸡兔同笼，头共10个，脚共28只，求鸡兔各几只？', a: '假设全是鸡，应有20只脚，多8只，兔=8÷2=4只，鸡=6只' }, steps: ['做出假设', '计算假设后的总脚数', '求脚数差', '计算另一种动物数量'] },
  { id: 'om_3_2', title: '盈亏问题', desc: '分配中的盈与亏', completed: false, knowledge: '盈亏问题的基本类型', method: '（盈+亏）÷两次分配差=人数', example: { q: '分糖果，每人5颗多10颗，每人7颗少6颗，求人数和糖果数。', a: '人数=(10+6)÷(7-5)=8人，糖果=5×8+10=50颗' }, steps: ['分析两次分配', '确定盈与亏', '套用公式', '求解'] },
  { id: 'om_4_1', title: '行程问题', desc: '路程、速度、时间的关系', completed: false, knowledge: '路程=速度×时间', method: '画图分析，找相遇或追及关系', example: { q: '甲乙两地相距300千米，A车速度60km/h，B车速度40km/h，相向而行，几小时相遇？', a: '相遇时间=300÷(60+40)=3小时' }, steps: ['画图理解题意', '确定运动方向', '找出速度和或速度差', '计算时间'] },
  { id: 'om_4_2', title: '追及问题', desc: '同向运动中的追及', completed: false, knowledge: '追及时间=路程差÷速度差', method: '找出路程差和速度差', example: { q: 'A车先行2小时，速度50km/h，B车速度70km/h，几小时追上？', a: '路程差=50×2=100km，追及时间=100÷(70-50)=5小时' }, steps: ['计算先行路程', '确定速度差', '套用追及公式', '求解'] },
  { id: 'om_5_1', title: '工程问题', desc: '工作效率与工作时间', completed: false, knowledge: '工作效率=工作量÷工作时间', method: '设总工作量为1，计算各自效率', example: { q: '甲单独做10天完成，乙单独做15天完成，合作几天完成？', a: '甲效率=1/10，乙效率=1/15，合作=1÷(1/10+1/15)=6天' }, steps: ['确定各自效率', '计算合作效率', '求合作时间'] },
  { id: 'om_5_2', title: '牛吃草问题', desc: '草在生长的动态问题', completed: false, knowledge: '草的生长速度不变', method: '设每头牛每天吃1份草，求草生长速度和原有草量', example: { q: '10头牛20天吃完，15头牛10天吃完，25头牛几天吃完？', a: '草生长速度=(10×20-15×10)÷(20-10)=5份/天，原有草=10×20-5×20=100份，25头牛=100÷(25-5)=5天' }, steps: ['设未知数', '列方程组', '求解生长速度', '计算天数'] },
  { id: 'om_6_1', title: '逻辑推理', desc: '根据条件进行推理', completed: false, knowledge: '排除法和假设法', method: '列表排除，假设验证', example: { q: '三人分别来自北京、上海、广州，A不是北京人，B不是上海人，广州人不是A也不是B。', a: 'C是广州人，A是上海人，B是北京人' }, steps: ['整理已知条件', '制作推理表格', '逐步排除', '得出结论'] },
  { id: 'om_6_2', title: '抽屉原理', desc: '最不利原则的应用', completed: false, knowledge: '抽屉原理的基本形式', method: '考虑最不利情况，再加1', example: { q: '袋中有红、黄、蓝三种球，至少摸几个才能保证有2个同色？', a: '最不利摸3个各1个，再摸1个必重复，所以4个' }, steps: ['确定抽屉数', '考虑最不利情况', '加1得到答案'] },
  { id: 'om_7_1', title: '数图形', desc: '有规律地数图形个数', completed: false, knowledge: '分类计数，不重不漏', method: '按大小或方向分类计数', example: { q: '一个长方形被分成3×2个小长方形，共有多少个长方形？', a: '横向线段数=1+2+3=6，纵向=1+2=3，总数=6×3=18' }, steps: ['观察图形结构', '确定分类方法', '分别计数', '求和'] },
  { id: 'om_7_2', title: '周期问题', desc: '发现规律，利用周期求解', completed: false, knowledge: '周期=重复出现的长度', method: '找出周期，用除法求余数', example: { q: '今天是星期一，100天后是星期几？', a: '100÷7=14余2，星期一+2=星期三' }, steps: ['找出周期长度', '计算总数除以周期', '根据余数确定答案'] },
])

const doneCount = computed(() => topics.value.filter(t => t.completed).length)
const progressPercent = computed(() => Math.round((doneCount.value / 20) * 100))

function selectTopic(topic) {
  selectedTopic.value = selectedTopic.value?.id === topic.id ? null : topic
}

onMounted(async () => {
  try {
    const p = await getProgress().catch(() => ({}))
    progress.value = p
    const done = p?.doneOM || []
    topics.value.forEach(t => {
      t.completed = done.includes(t.id)
    })
  } catch (e) {
    console.error('加载进度失败:', e)
  }
})
</script>

<style scoped>
.olympiad-view {
  max-width: 1200px;
  margin: 0 auto;
}

/* 英雄区 */
.subject-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(129, 140, 248, 0.05) 100%);
  border-radius: 16px;
  border: 1px solid rgba(251, 191, 36, 0.15);
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
  color: #fbbf24;
}

.progress-count {
  font-size: 13px;
  color: var(--text2);
}

/* 专题时间轴 */
.topics-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.topics-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.topic-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.topic-item:hover {
  background: var(--surface2);
}

.topic-item.completed {
  border-left-color: #fbbf24;
}

.topic-item.active {
  background: var(--surface2);
  border-left-color: var(--accent);
}

.topic-marker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--surface3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--text2);
  flex-shrink: 0;
}

.topic-item.completed .topic-marker {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.topic-check {
  font-size: 16px;
}

.topic-info {
  flex: 1;
}

.topic-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 2px;
}

.topic-desc {
  font-size: 13px;
  color: var(--text2);
}

/* 详情 */
.topic-detail-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.topic-detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-block {
  padding: 16px;
  background: var(--surface2);
  border-radius: 10px;
}

.detail-block h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 10px;
}

.detail-block p {
  font-size: 14px;
  color: var(--text);
  line-height: 1.6;
}

.example-box {
  padding: 12px;
  background: var(--surface);
  border-radius: 8px;
}

.example-q {
  margin-bottom: 8px;
}

.example-a {
  color: var(--accent);
}

.steps-list {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.steps-list li {
  font-size: 14px;
  color: var(--text);
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

.btn-text {
  background: none;
  border: none;
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
}

.btn-text:hover {
  color: var(--text);
}

@media (max-width: 768px) {
  .subject-hero {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
}
</style>
