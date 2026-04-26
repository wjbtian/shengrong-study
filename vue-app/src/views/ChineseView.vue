<template>
  <div class="chinese-view">
    <!-- 顶部英雄区 -->
    <section class="subject-hero">
      <div class="subject-hero-main">
        <div class="subject-hero-icon">📚</div>
        <div class="subject-hero-info">
          <h1 class="subject-hero-title">语文学习</h1>
          <p class="subject-hero-subtitle">部编版四年级下册 · 8个单元 · 循序渐进</p>
        </div>
      </div>
      <div class="subject-hero-progress">
        <div class="progress-ring-wrap">
          <svg viewBox="0 0 120 120" class="progress-ring">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
            <circle cx="60" cy="60" r="54" fill="none" stroke="#4ade80" stroke-width="8"
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
        <span class="stat-value">8</span>
        <span class="stat-label">古诗词</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">40</span>
        <span class="stat-label">生字</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">80</span>
        <span class="stat-label">词语</span>
      </div>
    </div>

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

    <!-- 古诗词专区 -->
    <section class="poems-section">
      <div class="section-header">
        <h2 class="section-title">🌸 古诗词精选</h2>
        <span class="section-subtitle">本册必背古诗词</span>
      </div>
      <div class="poems-grid">
        <div v-for="poem in poems" :key="poem.title" class="poem-card">
          <h4 class="poem-title">{{ poem.title }}</h4>
          <p class="poem-author">{{ poem.author }}</p>
          <p class="poem-content">{{ poem.content }}</p>
        </div>
      </div>
    </section>

    <!-- 单元详情弹窗 -->
    <div v-if="selectedUnit" class="modal" @click.self="selectedUnit = null">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h3>第{{ selectedUnit.num }}单元：{{ selectedUnit.title }}</h3>
          <button class="modal-close" @click="selectedUnit = null">✕</button>
        </div>
        <div class="modal-body">
          <div class="unit-detail-section">
            <h4>📖 课文</h4>
            <div class="lesson-list">
              <div v-for="lesson in selectedUnit.lessons" :key="lesson.num" class="lesson-item">
                <span class="lesson-num">{{ lesson.num }}</span>
                <div class="lesson-info">
                  <span class="lesson-title">{{ lesson.title }}</span>
                  <span v-if="lesson.author" class="lesson-author">{{ lesson.author }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="selectedUnit.poems?.length" class="unit-detail-section">
            <h4>🌸 古诗词</h4>
            <div v-for="poem in selectedUnit.poems" :key="poem.title" class="poem-detail">
              <h5>{{ poem.title }} · {{ poem.author }}</h5>
              <p>{{ poem.content }}</p>
            </div>
          </div>
          <div class="unit-detail-section">
            <h4>📝 语文要素</h4>
            <ul>
              <li v-for="(k, i) in selectedUnit.knowledge" :key="i">{{ k }}</li>
            </ul>
          </div>
          <div class="unit-detail-section">
            <h4>✍️ 习作</h4>
            <p>{{ selectedUnit.writing }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProgress } from '../utils/api.js'

const progress = ref({})
const selectedUnit = ref(null)

const units = ref([
  { id: 'ch_1', num: 1, title: '田园生活', desc: '古诗词三首、乡下人家、天窗', completed: false, lessons: [{num:1,title:'古诗词三首'},{num:2,title:'乡下人家',author:'陈醉云'},{num:3,title:'天窗',author:'茅盾'},{num:4,title:'三月桃花水',author:'刘湛秋'}], poems: [{title:'四时田园杂兴（其二十五）',author:'范成大',content:'梅子金黄杏子肥，麦花雪白菜花稀。\n日长篱落无人过，惟有蜻蜓蛱蝶飞。'}], knowledge: ['抓住关键语句，初步体会课文表达的思想感情'], writing: '我的乐园' },
  { id: 'ch_2', num: 2, title: '科普世界', desc: '琥珀、飞向蓝天的恐龙、纳米技术', completed: false, lessons: [{num:5,title:'琥珀',author:'柏吉尔'},{num:6,title:'飞向蓝天的恐龙',author:'徐星'},{num:7,title:'纳米技术就在我们身边'},{num:8,title:'千年梦圆在今朝'}], poems: [{title:'江畔独步寻花',author:'杜甫',content:'黄师塔前江水东，春光懒困倚微风。\n桃花一簇开无主，可爱深红爱浅红？'}], knowledge: ['阅读时能提出不懂的问题，并试着解决'], writing: '我的奇思妙想' },
  { id: 'ch_3', num: 3, title: '现代诗歌', desc: '短诗三首、绿、白桦', completed: false, lessons: [{num:9,title:'短诗三首',author:'冰心'},{num:10,title:'绿',author:'艾青'},{num:11,title:'白桦',author:'叶赛宁'},{num:12,title:'在天晴了的时候',author:'戴望舒'}], poems: [{title:'繁星（七一）',author:'冰心',content:'这些事——\n是永不漫灭的回忆：\n月明的园中，\n藤萝的叶下，\n母亲的膝上。'}], knowledge: ['初步了解现代诗的特点，体会诗歌的情感'], writing: '轻叩诗歌大门' },
  { id: 'ch_4', num: 4, title: '动物朋友', desc: '猫、母鸡、白鹅', completed: false, lessons: [{num:13,title:'猫',author:'老舍'},{num:14,title:'母鸡',author:'老舍'},{num:15,title:'白鹅',author:'丰子恺'}], poems: [{title:'蜂',author:'罗隐',content:'不论平地与山尖，无限风光尽被占。\n采得百花成蜜后，为谁辛苦为谁甜？'}], knowledge: ['体会作家是如何表达对动物的感情的'], writing: '我的动物朋友' },
  { id: 'ch_5', num: 5, title: '景物描写', desc: '海上日出、记金华的双龙洞', completed: false, lessons: [{num:16,title:'海上日出',author:'巴金'},{num:17,title:'记金华的双龙洞',author:'叶圣陶'}], poems: [{title:'独坐敬亭山',author:'李白',content:'众鸟高飞尽，孤云独去闲。\n相看两不厌，只有敬亭山。'}], knowledge: ['了解课文按一定顺序写景物的方法'], writing: '游____' },
  { id: 'ch_6', num: 6, title: '成长故事', desc: '小英雄雨来、我们家的男子汉、芦花鞋', completed: false, lessons: [{num:18,title:'小英雄雨来'},{num:19,title:'我们家的男子汉',author:'王安忆'},{num:20,title:'芦花鞋',author:'曹文轩'}], poems: [{title:'芙蓉楼送辛渐',author:'王昌龄',content:'寒雨连江夜入吴，平明送客楚山孤。\n洛阳亲友如相问，一片冰心在玉壶。'}], knowledge: ['学习把握长文章的主要内容'], writing: '我学会了____' },
  { id: 'ch_7', num: 7, title: '人物品质', desc: '古诗三首、文言文二则、诺曼底号遇难记', completed: false, lessons: [{num:21,title:'古诗三首'},{num:22,title:'文言文二则'},{num:23,title:'"诺曼底号"遇难记',author:'雨果'},{num:24,title:'黄继光'},{num:25,title:'挑山工',author:'冯骥才'}], poems: [{title:'塞下曲',author:'卢纶',content:'月黑雁飞高，单于夜遁逃。\n欲将轻骑逐，大雪满弓刀。'}], knowledge: ['从人物的语言、动作等描写中感受人物的品质'], writing: '我的"自画像"' },
  { id: 'ch_8', num: 8, title: '童话世界', desc: '宝葫芦的秘密、巨人的花园、海的女儿', completed: false, lessons: [{num:26,title:'宝葫芦的秘密',author:'张天翼'},{num:27,title:'巨人的花园',author:'王尔德'},{num:28,title:'海的女儿',author:'安徒生'}], poems: [{title:'卜算子·咏梅',author:'毛泽东',content:'风雨送春归，飞雪迎春到。\n已是悬崖百丈冰，犹有花枝俏。\n俏也不争春，只把春来报。\n待到山花烂漫时，她在丛中笑。'}], knowledge: ['感受童话的奇妙，体会人物真善美的形象'], writing: '故事新编' },
])

const poems = ref([
  { title: '四时田园杂兴（其二十五）', author: '范成大', content: '梅子金黄杏子肥，麦花雪白菜花稀。日长篱落无人过，惟有蜻蜓蛱蝶飞。' },
  { title: '宿新市徐公店', author: '杨万里', content: '篱落疏疏一径深，树头新绿未成阴。儿童急走追黄蝶，飞入菜花无处寻。' },
  { title: '清平乐·村居', author: '辛弃疾', content: '茅檐低小，溪上青青草。醉里吴音相媚好，白发谁家翁媪？大儿锄豆溪东，中儿正织鸡笼。最喜小儿亡赖，溪头卧剥莲蓬。' },
  { title: '江畔独步寻花', author: '杜甫', content: '黄师塔前江水东，春光懒困倚微风。桃花一簇开无主，可爱深红爱浅红？' },
  { title: '蜂', author: '罗隐', content: '不论平地与山尖，无限风光尽被占。采得百花成蜜后，为谁辛苦为谁甜？' },
  { title: '独坐敬亭山', author: '李白', content: '众鸟高飞尽，孤云独去闲。相看两不厌，只有敬亭山。' },
  { title: '芙蓉楼送辛渐', author: '王昌龄', content: '寒雨连江夜入吴，平明送客楚山孤。洛阳亲友如相问，一片冰心在玉壶。' },
  { title: '塞下曲', author: '卢纶', content: '月黑雁飞高，单于夜遁逃。欲将轻骑逐，大雪满弓刀。' },
])

const doneCount = computed(() => units.value.filter(u => u.completed).length)
const progressPercent = computed(() => Math.round((doneCount.value / 8) * 100))

function openUnit(unit) {
  selectedUnit.value = unit
}

onMounted(async () => {
  try {
    const p = await getProgress().catch(() => ({}))
    progress.value = p
    const done = p?.doneUnits || []
    units.value.forEach(u => {
      u.completed = done.includes(u.id)
    })
  } catch (e) {
    console.error('加载进度失败:', e)
  }
})
</script>

<style scoped>
.chinese-view {
  max-width: 1200px;
  margin: 0 auto;
}

/* 英雄区 */
.subject-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px;
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.08) 0%, rgba(129, 140, 248, 0.05) 100%);
  border-radius: 16px;
  border: 1px solid rgba(74, 222, 128, 0.15);
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
  color: var(--accent);
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
  color: var(--accent);
}

.stat-label {
  font-size: 13px;
  color: var(--text2);
  margin-top: 4px;
}

/* 单元 */
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
  border-color: var(--accent);
}

.unit-number {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--accent-dim);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
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
  color: var(--accent);
}

/* 古诗词 */
.poems-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}

.poems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.poem-card {
  padding: 16px;
  background: var(--surface2);
  border-radius: 10px;
}

.poem-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.poem-author {
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 8px;
}

.poem-content {
  font-size: 14px;
  color: var(--text);
  line-height: 1.8;
  white-space: pre-line;
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

.modal-lg {
  max-width: 700px;
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
  color: var(--accent);
  margin-bottom: 10px;
}

.lesson-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--surface2);
  border-radius: 8px;
}

.lesson-num {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--accent-dim);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.lesson-info {
  display: flex;
  flex-direction: column;
}

.lesson-title {
  font-size: 14px;
  color: var(--text);
}

.lesson-author {
  font-size: 12px;
  color: var(--text2);
}

.poem-detail {
  padding: 12px;
  background: var(--surface2);
  border-radius: 8px;
  margin-bottom: 8px;
}

.poem-detail h5 {
  font-size: 14px;
  color: var(--text);
  margin-bottom: 6px;
}

.poem-detail p {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.8;
  white-space: pre-line;
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
  .stats-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .units-grid {
    grid-template-columns: 1fr;
  }
}
</style>
