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

    <!-- 专题分类标签 -->
    <section class="category-tabs">
      <button 
        v-for="cat in categories" 
        :key="cat.id"
        class="category-tab"
        :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id"
      >
        <span class="tab-icon">{{ cat.icon }}</span>
        <span class="tab-name">{{ cat.name }}</span>
      </button>
    </section>

    <!-- 知识点卡片网格 -->
    <section class="topics-grid">
      <div 
        v-for="topic in filteredTopics" 
        :key="topic.id"
        class="topic-card"
        :class="{ completed: topic.completed }"
        @click="openTopic(topic)"
      >
        <div class="card-header">
          <div class="card-num">{{ topic.num }}</div>
          <div class="card-badges">
            <span class="badge difficulty" :class="topic.difficulty">{{ topic.difficultyText }}</span>
            <span class="badge type">{{ topic.type }}</span>
          </div>
        </div>
        <h3 class="card-title">{{ topic.title }}</h3>
        <p class="card-desc">{{ topic.desc }}</p>
        <div class="card-footer">
          <span class="card-status" v-if="topic.completed">✅ 已完成</span>
          <span class="card-status" v-else>📖 点击学习</span>
        </div>
      </div>
    </section>

    <!-- 专题详情弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ selectedTopic?.title }}</h2>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        
        <div class="modal-body" v-if="selectedTopic">
          <!-- 知识点 -->
          <div class="detail-section">
            <h4>📝 核心知识点</h4>
            <p>{{ selectedTopic.knowledge }}</p>
          </div>
          
          <!-- 解题方法 -->
          <div class="detail-section">
            <h4>🔧 解题方法</h4>
            <p>{{ selectedTopic.method }}</p>
          </div>
          
          <!-- 例题 -->
          <div class="detail-section example">
            <h4>🎯 例题精讲</h4>
            <div class="example-box">
              <div class="example-q">
                <strong>题目：</strong>{{ selectedTopic.example.q }}
              </div>
              <div class="example-steps">
                <div v-for="(step, i) in selectedTopic.example.steps" :key="i" class="step">
                  <span class="step-num">{{ i + 1 }}</span>
                  <p>{{ step }}</p>
                </div>
              </div>
              <div class="example-a">
                <strong>答案：</strong>{{ selectedTopic.example.a }}
              </div>
            </div>
          </div>
          
          <!-- 口诀 -->
          <div class="detail-section tips">
            <h4>💡 解题口诀</h4>
            <ul>
              <li v-for="(tip, i) in selectedTopic.tips" :key="i">{{ tip }}</li>
            </ul>
          </div>
          
          <!-- 练习 -->
          <div class="detail-section practice">
            <h4>✏️ 举一反三</h4>
            <div class="practice-box">
              <p><strong>练习题：</strong>{{ selectedTopic.practice.q }}</p>
              <button class="btn-answer" @click="showAnswer = !showAnswer">
                {{ showAnswer ? '隐藏答案' : '查看答案' }}
              </button>
              <p v-if="showAnswer" class="practice-a">
                <strong>解答：</strong>{{ selectedTopic.practice.a }}
              </p>
            </div>
          </div>

          <!-- 完成/取消完成按钮 -->
          <div class="detail-section complete-action">
            <button 
              class="btn-complete" 
              :class="{ done: selectedTopic.completed }"
              @click="toggleComplete(selectedTopic)"
            >
              {{ selectedTopic.completed ? '✅ 已完成 · 点击取消' : '🎯 标记为已完成' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProgress, markProgress, unmarkProgress } from '../utils/api.js'

const progress = ref({})
const selectedTopic = ref(null)
const showModal = ref(false)
const showAnswer = ref(false)
const showPracticeAnswer = ref({})
const activeCategory = ref('all')

const categories = [
  { id: 'all', name: '全部', icon: '📚' },
  { id: 'calc', name: '计算类', icon: '🧮' },
  { id: 'app', name: '应用类', icon: '📐' },
  { id: 'logic', name: '逻辑类', icon: '🧩' },
]

const topics = ref([
  {
    id: 'om_1_1', num: 1, title: '和差问题', desc: '已知两数的和与差，求这两个数',
    difficulty: 'easy', difficultyText: '基础', type: '计算类', category: 'calc', completed: false,
    knowledge: '和差问题的基本公式：大数 = (和 + 差) ÷ 2，小数 = (和 - 差) ÷ 2',
    method: '先判断求大数还是小数，然后套用对应公式',
    example: {
      q: '小明和小红共有邮票86张，小明比小红多14张。两人各有邮票多少张？',
      steps: ['理解题意：已知两数和为86，差为14', '判断：小明多，所以小明是大数，小红是小数', '求大数（小明）：(86 + 14) ÷ 2 = 50张', '求小数（小红）：(86 - 14) ÷ 2 = 36张', '验证：50 + 36 = 86，50 - 36 = 14，符合题意'],
      a: '小明有50张，小红有36张'
    },
    tips: ['和加差除以2得大数', '和减差除以2得小数', '最后一定要验证'],
    practice: { q: '甲乙两班共有学生96人，从甲班调8人到乙班后，两班人数相等。原来两班各有多少人？', a: '调动后相等，说明原来相差16人。甲班：(96+16)÷2=56人，乙班：(96-16)÷2=40人' }
  },
  {
    id: 'om_1_2', num: 2, title: '和倍问题', desc: '已知两数的和与倍数关系',
    difficulty: 'easy', difficultyText: '基础', type: '计算类', category: 'calc', completed: false,
    knowledge: '和倍公式：小数 = 和 ÷ (倍数 + 1)，大数 = 小数 × 倍数',
    method: '画线段图，找出1倍数，再求多倍数',
    example: {
      q: '果园里有苹果树和梨树共240棵，苹果树是梨树的3倍。两种树各有多少棵？',
      steps: ['画线段图：梨树画1段，苹果树画3段', '总段数：1 + 3 = 4段', '1倍数（梨树）：240 ÷ 4 = 60棵', '多倍数（苹果树）：60 × 3 = 180棵', '验证：60 + 180 = 240，180 ÷ 60 = 3，正确'],
      a: '梨树60棵，苹果树180棵'
    },
    tips: ['先画线段图帮助理解', '找出总份数', '用和除以总份数得1倍数'],
    practice: { q: '一个长方形周长是72厘米，长是宽的2倍。长和宽各是多少厘米？', a: '长+宽=36厘米，宽=36÷(2+1)=12厘米，长=12×2=24厘米' }
  },
  {
    id: 'om_1_3', num: 3, title: '差倍问题', desc: '已知两数的差与倍数关系',
    difficulty: 'medium', difficultyText: '进阶', type: '计算类', category: 'calc', completed: false,
    knowledge: '差倍公式：小数 = 差 ÷ (倍数 - 1)，大数 = 小数 × 倍数',
    method: '理解"差"对应的是几倍数',
    example: {
      q: '甲数比乙数大63，甲数是乙数的4倍。甲乙两数各是多少？',
      steps: ['画线段图：乙数画1段，甲数画4段', '甲比乙多：4 - 1 = 3段', '3段对应63，所以1段（乙数）= 63 ÷ 3 = 21', '甲数 = 21 × 4 = 84', '验证：84 - 21 = 63，84 ÷ 21 = 4，正确'],
      a: '甲数是84，乙数是21'
    },
    tips: ['差对应的是倍数减1', '先求1倍数是关键', '注意谁是谁的几倍'],
    practice: { q: '被除数比除数大224，商是5。被除数和除数各是多少？', a: '被除数是除数的5倍，差224对应4倍。除数=224÷(5-1)=56，被除数=56×5=280' }
  },
  {
    id: 'om_2_1', num: 4, title: '年龄问题', desc: '利用年龄差不变解题',
    difficulty: 'medium', difficultyText: '进阶', type: '应用类', category: 'app', completed: false,
    knowledge: '年龄差永远不变，但年龄倍数会变化',
    method: '抓住年龄差不变，转化为和差倍问题',
    example: {
      q: '爸爸今年40岁，儿子今年12岁。几年前爸爸的年龄是儿子的5倍？',
      steps: ['计算年龄差：40 - 12 = 28岁（永远不变）', '设几年前儿子年龄为1份，爸爸就是5份', '差是4份，对应28岁，所以1份 = 28 ÷ 4 = 7岁', '那时儿子7岁，现在是12岁', '12 - 7 = 5年前', '验证：5年前爸爸35岁，儿子7岁，35÷7=5，正确'],
      a: '5年前'
    },
    tips: ['年龄差永远不变', '倍数会随时间变化', '通常转化为差倍问题'],
    practice: { q: '妈妈今年35岁，女儿今年7岁。几年后妈妈的年龄是女儿的3倍？', a: '年龄差28岁不变。女儿=28÷(3-1)=14岁时，妈妈42岁。14-7=7年后' }
  },
  {
    id: 'om_2_2', num: 5, title: '植树问题', desc: '线段上的点数与段数关系',
    difficulty: 'easy', difficultyText: '基础', type: '应用类', category: 'app', completed: false,
    knowledge: '两端都植：棵数=段数+1；一端植：棵数=段数；两端不植：棵数=段数-1；环形：棵数=段数',
    method: '先判断植树类型，再确定棵数与段数关系',
    example: {
      q: '一条长200米的道路两旁种树，每隔5米种一棵，两端都种。一共需要多少棵树苗？',
      steps: ['计算段数：200 ÷ 5 = 40段', '两端都种，一边棵数 = 40 + 1 = 41棵', '道路两旁：41 × 2 = 82棵', '验证：41棵树有40个间隔，40×5=200米，正确'],
      a: '一共需要82棵树苗'
    },
    tips: ['先算段数', '判断两端是否都种', '注意是单边还是双边'],
    practice: { q: '圆形花坛周长120米，每隔6米摆一盆花。需要多少盆花？', a: '环形植树：棵数=段数=120÷6=20盆' }
  },
  {
    id: 'om_3_1', num: 6, title: '鸡兔同笼', desc: '经典的假设法应用',
    difficulty: 'medium', difficultyText: '进阶', type: '应用类', category: 'app', completed: false,
    knowledge: '假设全是鸡或全是兔，通过腿数差异求解',
    method: '假设法：假设全是鸡，多出来的腿就是兔子的',
    example: {
      q: '鸡兔同笼，共有头35个，脚94只。鸡兔各有多少只？',
      steps: ['假设全是鸡：35只鸡有70只脚', '实际94只脚，少了94-70=24只', '每只兔比鸡多2只脚', '兔子数量 = 24 ÷ 2 = 12只', '鸡的数量 = 35 - 12 = 23只', '验证：23×2+12×4=46+48=94，正确'],
      a: '鸡23只，兔12只'
    },
    tips: ['假设全是鸡，差值除以2得兔', '假设全是兔，差值除以2得鸡', '也可以列方程解'],
    practice: { q: '停车场有汽车和摩托车共40辆，轮子共136个。汽车（4轮）和摩托车（2轮）各多少辆？', a: '假设全是摩托车：80个轮子。差56个，汽车=56÷2=28辆，摩托车=12辆' }
  },
  {
    id: 'om_3_2', num: 7, title: '盈亏问题', desc: '分配中的余缺问题',
    difficulty: 'medium', difficultyText: '进阶', type: '应用类', category: 'app', completed: false,
    knowledge: '盈亏公式：人数 = (盈 + 亏) ÷ 两次分配差',
    method: '比较两次分配，找出总差额和每人差额',
    example: {
      q: '分糖果，每人5颗剩16颗，每人7颗缺8颗。有多少人？多少颗糖？',
      steps: ['第一次：盈16颗', '第二次：亏8颗', '总差额：16 + 8 = 24颗', '每人差额：7 - 5 = 2颗', '人数 = 24 ÷ 2 = 12人', '糖数 = 12×5 + 16 = 76颗', '验证：12×7 - 8 = 76，正确'],
      a: '12人，76颗糖'
    },
    tips: ['一盈一亏：盈加亏除以分配差', '两次都盈：大盈减小盈除以分配差', '两次都亏：大亏减小亏除以分配差'],
    practice: { q: '分苹果，每人3个剩20个，每人5个正好分完。有多少人？多少个苹果？', a: '盈20，亏0。人数=20÷(5-3)=10人，苹果=10×5=50个' }
  },
  {
    id: 'om_4_1', num: 8, title: '相遇问题', desc: '相向而行的路程计算',
    difficulty: 'medium', difficultyText: '进阶', type: '应用类', category: 'app', completed: false,
    knowledge: '相遇时间 = 总路程 ÷ 速度和',
    method: '画图理解运动过程，找出路程、速度、时间关系',
    example: {
      q: '甲乙两车从A、B两地同时相向开出，甲速60km/h，乙速40km/h，3小时后相遇。AB两地相距多远？',
      steps: ['速度和：60 + 40 = 100km/h', '相遇时间：3小时', '总路程 = 速度和 × 时间 = 100 × 3 = 300km', '验证：甲走180km，乙走120km，180+120=300，正确'],
      a: 'AB两地相距300千米'
    },
    tips: ['相向而行用速度和', '同向而行用速度差', '画图帮助理解'],
    practice: { q: '两人从相距2400米的两地相向而行，A速80米/分，B速70米/分。几分钟后相遇？', a: '速度和150米/分，时间=2400÷150=16分钟' }
  },
  {
    id: 'om_4_2', num: 9, title: '追及问题', desc: '同向而行的追及计算',
    difficulty: 'hard', difficultyText: '挑战', type: '应用类', category: 'app', completed: false,
    knowledge: '追及时间 = 路程差 ÷ 速度差',
    method: '找出初始距离差和速度差',
    example: {
      q: '甲在乙前方120米，甲速50米/分，乙速70米/分。乙几分钟后追上甲？',
      steps: ['速度差：70 - 50 = 20米/分', '路程差：120米', '追及时间 = 120 ÷ 20 = 6分钟', '验证：甲走300米，乙走420米，420-300=120，正确'],
      a: '6分钟后追上'
    },
    tips: ['追及用速度差', '先找路程差', '注意出发时间是否相同'],
    practice: { q: '快车长200米，慢车长150米，同向行驶。快车速度25m/s，慢车15m/s。快车完全超过慢车需要几秒？', a: '路程差=200+150=350米，速度差=10m/s，时间=350÷10=35秒' }
  },
  {
    id: 'om_5_1', num: 10, title: '平均数问题', desc: '求平均数与总数的关系',
    difficulty: 'easy', difficultyText: '基础', type: '计算类', category: 'calc', completed: false,
    knowledge: '平均数 = 总数 ÷ 份数，总数 = 平均数 × 份数',
    method: '利用平均数与总数的关系求解',
    example: {
      q: '小明前三次考试平均85分，第四次考93分。四次平均多少分？',
      steps: ['前三次总分：85 × 3 = 255分', '四次总分：255 + 93 = 348分', '四次平均：348 ÷ 4 = 87分', '验证：(85×3+93)÷4=87，正确'],
      a: '四次平均87分'
    },
    tips: ['平均数×个数=总数', '移多补少法', '注意份数变化'],
    practice: { q: '5个数的平均数是30，把其中一个数改为50后，平均数变成32。被改的数原来是多少？', a: '总数增加(32-30)×5=10，原数=50-10=40' }
  },
  {
    id: 'om_5_2', num: 11, title: '归一问题', desc: '先求单一量再求解',
    difficulty: 'medium', difficultyText: '进阶', type: '计算类', category: 'calc', completed: false,
    knowledge: '先求出单位量，再根据题意计算',
    method: '归一：总数 ÷ 份数 = 单一量',
    example: {
      q: '3台机器5小时生产150个零件。8台机器10小时能生产多少个？',
      steps: ['1台1小时：150 ÷ 3 ÷ 5 = 10个', '8台10小时：10 × 8 × 10 = 800个', '验证：10×8×10=800，正确'],
      a: '800个零件'
    },
    tips: ['先求单一量', '正归一：求出单位量再乘', '反归一：总数除以单位量'],
    practice: { q: '4人6天挖土120方。要挖300方，5人需要几天？', a: '1人1天=120÷4÷6=5方，5人1天=25方，300÷25=12天' }
  },
  {
    id: 'om_6_1', num: 12, title: '逻辑推理', desc: '根据条件推理结论',
    difficulty: 'medium', difficultyText: '进阶', type: '逻辑类', category: 'logic', completed: false,
    knowledge: '利用排除法、假设法、列表法进行推理',
    method: '画表格，根据条件逐一排除',
    example: {
      q: '甲、乙、丙三人，一人是医生，一人是教师，一人是工程师。已知：甲不是医生，乙不是教师，丙是工程师。三人的职业分别是什么？',
      steps: ['列表：医生、教师、工程师', '丙是工程师（确定）', '甲不是医生，所以甲是教师', '乙只能是医生', '验证：甲教师、乙医生、丙工程师，符合所有条件'],
      a: '甲是教师，乙是医生，丙是工程师'
    },
    tips: ['画表格帮助分析', '从确定条件入手', '用排除法逐步缩小范围'],
    practice: { q: 'A、B、C三人分别来自北京、上海、广州。A不是北京人，B不是上海人，C不是广州人。三人分别来自哪里？', a: 'A是上海人，B是广州人，C是北京人' }
  },
  {
    id: 'om_6_2', num: 13, title: '抽屉原理', desc: '最不利原则的应用',
    difficulty: 'hard', difficultyText: '挑战', type: '逻辑类', category: 'logic', completed: false,
    knowledge: '把n+1个物体放入n个抽屉，至少有一个抽屉有2个或更多物体',
    method: '考虑最不利情况，再加1',
    example: {
      q: '袋子里有红、黄、蓝三种颜色的球各5个。至少摸出几个球，才能保证一定有2个同色？',
      steps: ['最不利情况：每种颜色各摸1个，共3个', '再摸1个，必然与前面某颜色重复', '所以至少摸：3 + 1 = 4个', '验证：摸4个时，3种颜色分配，必有某色≥2'],
      a: '至少摸出4个'
    },
    tips: ['考虑最不利情况', '最不利+1就是答案', '颜色种类=抽屉数'],
    practice: { q: '一副扑克牌（去掉大小王）有4种花色各13张。至少抽几张才能保证有3张同花色？', a: '最不利：每种花色抽2张，共8张。再抽1张必成3张同花色。答案：9张' }
  },
  {
    id: 'om_7_1', num: 14, title: '数图形', desc: '有序数出图形个数',
    difficulty: 'medium', difficultyText: '进阶', type: '逻辑类', category: 'logic', completed: false,
    knowledge: '按大小、方向、位置分类计数，避免重复遗漏',
    method: '分类计数：先数单个，再数组合',
    example: {
      q: '下图中有几个三角形？（一个正方形被对角线分成4个三角形）',
      steps: ['单个小三角形：4个', '由2个小三角形组成的：0个（不相邻）', '由4个小三角形组成的大三角形：0个', '总计：4个'],
      a: '4个三角形'
    },
    tips: ['按大小分类', '先数单个再数组合', '标记已数的避免重复'],
    practice: { q: '一条线段上有5个点（含端点），共有多少条线段？', a: '4+3+2+1=10条，或C(5,2)=10条' }
  },
  {
    id: 'om_7_2', num: 15, title: '周期问题', desc: '找出循环规律求解',
    difficulty: 'medium', difficultyText: '进阶', type: '逻辑类', category: 'logic', completed: false,
    knowledge: '找出周期长度，用除法求余数定位',
    method: '确定周期 → 计算总数含几个周期 → 余数定位',
    example: {
      q: '今天是星期三，100天后是星期几？',
      steps: ['周期：7天', '100 ÷ 7 = 14余2', '从星期三往后数2天', '星期三→星期四→星期五', '所以100天后是星期五'],
      a: '星期五'
    },
    tips: ['找出周期长度', '用总数除以周期', '余数是几就往后数几'],
    practice: { q: '彩灯按红、黄、蓝、绿循环，第2024盏是什么颜色？', a: '周期4，2024÷4=506余0，所以是绿色（整除为周期最后一个）' }
  },
  {
    id: 'om_8_1', num: 16, title: '定义新运算', desc: '理解并应用自定义运算规则',
    difficulty: 'hard', difficultyText: '挑战', type: '计算类', category: 'calc', completed: false,
    knowledge: '按题目定义的运算规则进行计算',
    method: '仔细理解定义，代入数值计算',
    example: {
      q: '定义 a△b = a×b + a + b，求 3△4',
      steps: ['理解定义：a△b = a×b + a + b', '代入：a=3, b=4', '3△4 = 3×4 + 3 + 4 = 12 + 3 + 4 = 19', '验证：按定义计算，正确'],
      a: '19'
    },
    tips: ['仔细读定义', '按定义代入', '不要按常规运算律'],
    practice: { q: '定义 a*b = 2a + 3b，求 (2*3)*4', a: '2*3=2×2+3×3=13，13*4=2×13+3×4=38' }
  },
  {
    id: 'om_8_2', num: 17, title: '巧算速算', desc: '运用运算律简化计算',
    difficulty: 'medium', difficultyText: '进阶', type: '计算类', category: 'calc', completed: false,
    knowledge: '凑整、提取公因数、分组计算等技巧',
    method: '观察数字特点，选择合适的简便方法',
    example: {
      q: '计算：99×56 + 56',
      steps: ['观察：99×56 + 1×56', '提取公因数：56×(99+1)', '56×100 = 5600', '验证：99×56=5544，5544+56=5600，正确'],
      a: '5600'
    },
    tips: ['找凑整机会', '提取公因数', '分组计算'],
    practice: { q: '计算：125×32×25', a: '125×8×4×25=1000×100=100000' }
  },
  {
    id: 'om_9_1', num: 18, title: '页码问题', desc: '计算书本页码的数字个数',
    difficulty: 'medium', difficultyText: '进阶', type: '应用类', category: 'app', completed: false,
    knowledge: '分段计算：1-9页、10-99页、100-999页',
    method: '按位数分段，计算每段的数字个数',
    example: {
      q: '一本书有150页，编页码一共用了多少个数字？',
      steps: ['1-9页：9页×1=9个数字', '10-99页：90页×2=180个数字', '100-150页：51页×3=153个数字', '总计：9+180+153=342个'],
      a: '342个数字'
    },
    tips: ['分段计算', '1-9用1个，10-99用2个', '100-999用3个'],
    practice: { q: '编页码用了270个数字，这本书有多少页？', a: '1-9:9个，10-99:180个，还剩81个，81÷3=27页，共9+90+27=126页' }
  },
  {
    id: 'om_9_2', num: 19, title: '重叠问题', desc: '集合中的交集计算',
    difficulty: 'medium', difficultyText: '进阶', type: '应用类', category: 'app', completed: false,
    knowledge: '容斥原理：A∪B = A + B - A∩B',
    method: '画韦恩图，找出重叠部分',
    example: {
      q: '班级40人，数学优秀25人，语文优秀20人，两科都优秀10人。至少一科优秀的有多少人？',
      steps: ['数学优秀25人', '语文优秀20人', '两科都优秀10人（重叠）', '至少一科优秀 = 25 + 20 - 10 = 35人', '验证：只数学15+只语文10+两科10=35，正确'],
      a: '35人'
    },
    tips: ['画韦恩图', '重叠部分被重复计算', '减去重叠部分'],
    practice: { q: '长方形长12厘米，宽8厘米。一条长与一条宽重叠2厘米拼成L形，周长是多少？', a: '原周长40厘米，重叠后减少2×2=4厘米，新周长=40-4=36厘米' }
  },
  {
    id: 'om_10_1', num: 20, title: '牛吃草问题', desc: '动态变化中的平衡问题',
    difficulty: 'hard', difficultyText: '挑战', type: '应用类', category: 'app', completed: false,
    knowledge: '草每天生长，牛每天吃，求能吃几天或需要几头牛',
    method: '设每天草生长量和每头牛每天吃草量，列方程',
    example: {
      q: '牧场草供10头牛吃20天，或供15头牛吃10天。供25头牛能吃几天？',
      steps: ['设原有草G，每天生长g，每头牛每天吃1份', '10头20天：G + 20g = 10×20 = 200', '15头10天：G + 10g = 15×10 = 150', '两式相减：10g = 50，g = 5', 'G = 200 - 20×5 = 100', '25头牛：每天净吃25-5=20份', '天数 = 100 ÷ 20 = 5天'],
      a: '5天'
    },
    tips: ['设原有草和每天生长量', '两种情况列方程', '消元求解'],
    practice: { q: '水池有进水管和排水管。单开进水管5小时满，单开排水管7小时空。同时开几小时满？', a: '进速1/5，排速1/7，净速=1/5-1/7=2/35，时间=35/2=17.5小时' }
  }
])

const filteredTopics = computed(() => {
  if (activeCategory.value === 'all') return topics.value
  return topics.value.filter(t => t.category === activeCategory.value)
})

const doneCount = computed(() => topics.value.filter(t => t.completed).length)
const progressPercent = computed(() => Math.round((doneCount.value / topics.value.length) * 100))

function openTopic(topic) {
  selectedTopic.value = topic
  showModal.value = true
  showAnswer.value = false
}

async function toggleComplete(topic) {
  try {
    if (topic.completed) {
      await unmarkProgress('olympiad', topic.id)
      topic.completed = false
    } else {
      await markProgress('olympiad', topic.id)
      topic.completed = true
    }
  } catch (e) {
    console.error('进度更新失败', e)
  }
}

function closeModal() {
  showModal.value = false
  selectedTopic.value = null
}



onMounted(async () => {
  try {
    const p = await getProgress()
    if (p?.doneOM) {
      topics.value.forEach(t => {
        t.completed = p.doneOM.includes(`olympiad_${t.id}`)
      })
    }
  } catch (e) {
    console.log('进度加载失败', e)
  }
})
</script>

<style scoped>
.olympiad-view {
  padding: 50px 24px 0;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* 英雄区 */
.subject-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1));
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
}

.subject-hero-main {
  display: flex;
  align-items: center;
  gap: 20px;
}

.subject-hero-icon {
  font-size: 56px;
}

.subject-hero-title {
  font-size: 32px;
  font-weight: 700;
  color: #fbbf24;
  margin: 0 0 8px;
}

.subject-hero-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.subject-hero-progress {
  text-align: center;
}

.progress-ring-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 8px;
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.progress-percent {
  font-size: 28px;
  font-weight: 700;
  color: #fbbf24;
}

.progress-count {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

/* 分类标签 */
.category-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.category-tab:hover {
  background: rgba(255, 255, 255, 0.1);
}

.category-tab.active {
  background: rgba(251, 191, 36, 0.2);
  border-color: rgba(251, 191, 36, 0.5);
  color: #fbbf24;
}

.tab-icon {
  font-size: 18px;
}

/* 卡片网格 */
.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.topic-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.topic-card:hover {
  transform: translateY(-4px);
  border-color: rgba(251, 191, 36, 0.4);
  box-shadow: 0 8px 32px rgba(251, 191, 36, 0.15);
}

.topic-card.completed {
  border-color: rgba(74, 222, 128, 0.4);
  background: rgba(74, 222, 128, 0.05);
}

.topic-card.completed:hover {
  box-shadow: 0 8px 32px rgba(74, 222, 128, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-num {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}

.topic-card.completed .card-num {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}

.card-badges {
  display: flex;
  gap: 6px;
}

.badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.badge.easy {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}

.badge.medium {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.badge.hard {
  background: rgba(248, 113, 113, 0.2);
  color: #f87171;
}

.badge.type {
  background: rgba(129, 140, 248, 0.2);
  color: #818cf8;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px;
}

.card-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 16px;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.topic-card.completed .card-footer {
  color: #4ade80;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  width: 100%;
  max-width: 700px;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
}

.modal-header h2 {
  font-size: 24px;
  color: #fbbf24;
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.modal-body {
  padding: 24px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  font-size: 16px;
  color: #fbbf24;
  margin: 0 0 12px;
}

.detail-section p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
  margin: 0;
}

.detail-section ul {
  margin: 0;
  padding-left: 20px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.8;
}

.example-box {
  background: rgba(251, 191, 36, 0.05);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 12px;
  padding: 20px;
}

.example-q {
  font-size: 15px;
  color: #fff;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.example-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.step-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.step p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.example-a {
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #4ade80;
  font-weight: 500;
}

.tips {
  background: rgba(129, 140, 248, 0.05);
  border: 1px solid rgba(129, 140, 248, 0.2);
  border-radius: 12px;
  padding: 20px;
}

.tips h4 {
  color: #818cf8;
}

.practice-box {
  background: rgba(74, 222, 128, 0.05);
  border: 1px solid rgba(74, 222, 128, 0.2);
  border-radius: 12px;
  padding: 20px;
}

.practice-box h4 {
  color: #4ade80;
}

.btn-answer {
  margin-top: 12px;
  padding: 8px 20px;
  border-radius: 8px;
  border: 1px solid rgba(74, 222, 128, 0.4);
  background: rgba(74, 222, 128, 0.1);
  color: #4ade80;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-answer:hover {
  background: rgba(74, 222, 128, 0.2);
}

.practice-a {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

/* 完成按钮 */
.complete-action {
  text-align: center;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-complete {
  width: 100%;
  padding: 14px 24px;
  border-radius: 12px;
  border: 2px solid rgba(74, 222, 128, 0.5);
  background: rgba(74, 222, 128, 0.1);
  color: #4ade80;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-complete:hover {
  background: rgba(74, 222, 128, 0.2);
  border-color: rgba(74, 222, 128, 0.7);
}

.btn-complete.done {
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

.btn-complete.done:hover {
  background: rgba(251, 191, 36, 0.2);
}

/* 响应式 */
@media (max-width: 768px) {
  .olympiad-view {
    padding: 16px;
  }
  
  .subject-hero {
    flex-direction: column;
    gap: 20px;
    text-align: center;
    padding: 24px;
  }
  
  .subject-hero-title {
    font-size: 24px;
  }
  
  .topics-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    max-height: 90vh;
    margin: 10px;
  }
}
</style>