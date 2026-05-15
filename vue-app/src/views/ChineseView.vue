<template>
  <SubjectLayout
    icon="📚"
    title="语文学习"
    subtitle="部编版四年级下册 · 8个单元 · 循序渐进"
    color="#4ade80"
    :progressPercent="progressPercent"
    :doneCount="doneCount"
    :total="8"
    unitLabel="单元"
    :stats="[{ value: 8, label: '古诗词' }, { value: 40, label: '生字' }, { value: 80, label: '词语' }]"
  >
    <!-- 每日五字 -->
    <section class="daily-chars-section">
      <div class="section-header">
        <h2 class="section-title">✍️ 每日五字</h2>
        <div class="section-actions">
          <button class="history-btn" @click="showHistory = true">
            📋 查看历史
          </button>
          <button class="difficult-btn" @click="showDifficult = true">
            🔴 错字难字{{ difficultCount > 0 ? ` (${difficultCount})` : '' }}
          </button>
          <span class="section-subtitle">{{ dailyDate || '加载中...' }}</span>
        </div>
      </div>
      <div v-if="loading" class="loading-state">加载中...</div>
      <div v-else-if="error" class="error-state">{{ error }}</div>
      <div v-else class="chars-grid">
        <div 
          v-for="(char, idx) in dailyChars" 
          :key="char.id" 
          class="char-card"
          :class="{ practiced: char.practiced, difficult: char.is_difficult }"
        >
          <div class="char-header">
            <span class="char-index">{{ idx + 1 }}</span>
            <div class="char-badges">
              <span v-if="char.is_difficult" class="char-difficult-badge" title="错字难字">🔴</span>
              <span v-if="char.practiced" class="char-check">✅</span>
            </div>
          </div>
          <div class="char-main">
            <span class="char-char">{{ char.char }}</span>
            <span class="char-pinyin">{{ char.pinyin }}</span>
          </div>
          <div class="char-info">
            <div class="char-meta">
              <span class="char-radical">偏旁: {{ char.radical }}</span>
              <span class="char-strokes">{{ char.strokes }}画</span>
            </div>
            <div class="char-words">
              <span v-for="(w, i) in char.words" :key="i" class="word-tag">{{ w }}</span>
            </div>
            <div class="char-sentence">{{ char.sentence }}</div>
          </div>
          <button 
            class="practice-btn"
            :class="{ active: char.practiced }"
            @click="togglePractice(char)"
          >
            {{ char.practiced ? '已练 ✅' : '练完了' }}
          </button>
          <button 
            class="difficult-toggle-btn"
            :class="{ active: char.is_difficult }"
            @click="toggleDifficult(char)"
            :title="char.is_difficult ? '取消错字难字标记' : '标记为错字难字'"
          >
            {{ char.is_difficult ? '已标记 🔴' : '标记难点' }}
          </button>
        </div>
      </div>
      <div v-if="dailyChars.length > 0" class="daily-progress">
        今日已练 {{ practicedCount }}/{{ dailyChars.length }} 字
      </div>
    </section>

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
        <span class="section-subtitle">本册必背古诗词 · 已背 {{ poemCompletedCount }}/{{ poems.length }}</span>
      </div>
      <div class="poems-grid">
        <div 
          v-for="(poem, idx) in poems" 
          :key="poem.title" 
          class="poem-card"
          :class="{ completed: poem.completed }"
        >
          <div class="poem-card-header">
            <h4 class="poem-title">{{ poem.title }}</h4>
            <button 
              class="poem-complete-btn"
              :class="{ active: poem.completed }"
              @click.stop="togglePoem(poem, idx)"
              :title="poem.completed ? '取消已背' : '标记已背'"
            >
              {{ poem.completed ? '✅ 已背' : '背完了' }}
            </button>
          </div>
          <p class="poem-author">{{ poem.author }}</p>
          <p class="poem-content" :class="{ hidden: !poem.showContent }">{{ poem.content }}</p>
          <button class="poem-toggle-btn" @click="poem.showContent = !poem.showContent">
            {{ poem.showContent ? '收起' : '展开全文' }}
          </button>
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

    <!-- 错字难字弹窗 -->
    <div v-if="showDifficult" class="modal" @click.self="showDifficult = false">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h3>🔴 错字难字练习</h3>
          <button class="modal-close" @click="showDifficult = false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="difficultChars.length === 0" class="empty-state">
            <p>还没有标记错字难字</p>
            <p class="empty-hint">练字时点击"标记难点"按钮，可以标记需要重点复习的字</p>
          </div>
          <div v-else class="difficult-grid">
            <div 
              v-for="char in difficultChars" 
              :key="char.id" 
              class="char-card difficult-card"
            >
              <div class="char-main">
                <span class="char-char">{{ char.char }}</span>
                <span class="char-pinyin">{{ char.pinyin }}</span>
              </div>
              <div class="char-info">
                <div class="char-meta">
                  <span class="char-radical">偏旁: {{ char.radical }}</span>
                  <span class="char-strokes">{{ char.strokes }}画</span>
                </div>
                <div class="char-words">
                  <span v-for="(w, i) in char.words" :key="i" class="word-tag">{{ w }}</span>
                </div>
                <div class="char-sentence">{{ char.sentence }}</div>
              </div>
              <button 
                class="remove-difficult-btn"
                @click="toggleDifficult(char)"
              >
                取消标记
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 练字历史弹窗 -->
    <div v-if="showHistory" class="modal" @click.self="showHistory = false">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h3>📋 练字历史</h3>
          <button class="modal-close" @click="showHistory = false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="historyData.length === 0" class="empty-state">
            <p>暂无历史记录</p>
          </div>
          <div v-else class="history-list">
            <div v-for="day in historyData" :key="day.date" class="history-day">
              <div class="history-date">
                <span class="date-text">{{ formatDate(day.date) }}</span>
                <span class="date-weekday">{{ getWeekday(day.date) }}</span>
                <span v-if="isToday(day.date)" class="date-today">今天</span>
              </div>
              <div class="history-chars">
                <div 
                  v-for="char in day.chars" 
                  :key="char.id" 
                  class="history-char-card"
                  :class="{ practiced: char.practiced, difficult: char.is_difficult }"
                >
                  <span class="history-char">{{ char.char }}</span>
                  <span class="history-pinyin">{{ char.pinyin }}</span>
                  <span v-if="char.practiced" class="history-practiced">✅</span>
                  <span v-if="char.is_difficult" class="history-difficult">🔴</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SubjectLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SubjectLayout from '../components/SubjectLayout.vue'
import { useSubjectProgress } from '../composables/useSubjectProgress.js'
import { getChineseDaily, checkinChar, getChineseDifficult, setCharDifficult, getChineseHistory, getProgress, markProgress, unmarkProgress } from '../utils/api.js'

const selectedUnit = ref(null)
const showDifficult = ref(false)
const showHistory = ref(false)

// 每日五字状态
const dailyChars = ref([])
const dailyDate = ref('')
const loading = ref(true)
const error = ref(null)

// 错字难字状态
const difficultChars = ref([])
const difficultCount = computed(() => difficultChars.value.length)

// 历史记录状态
const historyData = ref([])

const practicedCount = computed(() => dailyChars.value.filter(c => c.practiced).length)

async function loadDailyChars() {
  try {
    loading.value = true
    error.value = null
    const data = await getChineseDaily()
    dailyChars.value = data.chars || []
    dailyDate.value = data.date || ''
  } catch (e) {
    error.value = '加载失败: ' + e.message
  } finally {
    loading.value = false
  }
}

async function togglePractice(char) {
  try {
    const practiced = !char.practiced
    await checkinChar(char.id, practiced)
    char.practiced = practiced
  } catch (e) {
    console.error('打卡失败:', e)
  }
}

async function toggleDifficult(char) {
  try {
    const newStatus = !char.is_difficult
    await setCharDifficult(char.id, newStatus)
    char.is_difficult = newStatus
    // 刷新错字难字列表
    await loadDifficultChars()
  } catch (e) {
    console.error('标记失败:', e)
  }
}

async function loadDifficultChars() {
  try {
    const data = await getChineseDifficult()
    difficultChars.value = data.chars || []
  } catch (e) {
    console.error('加载错字难字失败:', e)
  }
}

async function loadHistory() {
  try {
    const data = await getChineseHistory(7)
    historyData.value = data.history || []
  } catch (e) {
    console.error('加载历史记录失败:', e)
  }
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-')
  return `${parseInt(month)}月${parseInt(day)}日`
}

function getWeekday(dateStr) {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const date = new Date(dateStr)
  return weekdays[date.getDay()]
}

function isToday(dateStr) {
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  // 考虑北京时间
  const beijing = new Date(today.getTime() + 8 * 60 * 60 * 1000)
  const beijingStr = beijing.toISOString().slice(0, 10)
  return dateStr === beijingStr || dateStr === todayStr
}

onMounted(() => {
  loadDailyChars()
  loadDifficultChars()
  loadHistory()
  loadPoemProgress()
})

const { units, doneCount, progressPercent } = useSubjectProgress('chinese_', 8)

// 初始化单元数据
units.value = [
  { id: 'chinese_1', num: 1, title: '田园生活', desc: '古诗词三首、乡下人家、天窗', completed: false, lessons: [{num:1,title:'古诗词三首'},{num:2,title:'乡下人家',author:'陈醉云'},{num:3,title:'天窗',author:'茅盾'},{num:4,title:'三月桃花水',author:'刘湛秋'}], poems: [{title:'四时田园杂兴（其二十五）',author:'范成大',content:'梅子金黄杏子肥，麦花雪白菜花稀。\n日长篱落无人过，惟有蜻蜓蛱蝶飞。'}], knowledge: ['抓住关键语句，初步体会课文表达的思想感情'], writing: '我的乐园' },
  { id: 'chinese_2', num: 2, title: '科普世界', desc: '琥珀、飞向蓝天的恐龙、纳米技术', completed: false, lessons: [{num:5,title:'琥珀',author:'柏吉尔'},{num:6,title:'飞向蓝天的恐龙',author:'徐星'},{num:7,title:'纳米技术就在我们身边'},{num:8,title:'千年梦圆在今朝'}], poems: [{title:'江畔独步寻花',author:'杜甫',content:'黄师塔前江水东，春光懒困倚微风。\n桃花一簇开无主，可爱深红爱浅红？'}], knowledge: ['阅读时能提出不懂的问题，并试着解决'], writing: '我的奇思妙想' },
  { id: 'chinese_3', num: 3, title: '现代诗歌', desc: '短诗三首、绿、白桦', completed: false, lessons: [{num:9,title:'短诗三首',author:'冰心'},{num:10,title:'绿',author:'艾青'},{num:11,title:'白桦',author:'叶赛宁'},{num:12,title:'在天晴了的时候',author:'戴望舒'}], poems: [{title:'繁星（七一）',author:'冰心',content:'这些事——\n是永不漫灭的回忆：\n月明的园中，\n藤萝的叶下，\n母亲的膝上。'}], knowledge: ['初步了解现代诗的特点，体会诗歌的情感'], writing: '轻叩诗歌大门' },
  { id: 'chinese_4', num: 4, title: '动物朋友', desc: '猫、母鸡、白鹅', completed: false, lessons: [{num:13,title:'猫',author:'老舍'},{num:14,title:'母鸡',author:'老舍'},{num:15,title:'白鹅',author:'丰子恺'}], poems: [{title:'蜂',author:'罗隐',content:'不论平地与山尖，无限风光尽被占。\n采得百花成蜜后，为谁辛苦为谁甜？'}], knowledge: ['体会作家是如何表达对动物的感情的'], writing: '我的动物朋友' },
  { id: 'chinese_5', num: 5, title: '景物描写', desc: '海上日出、记金华的双龙洞', completed: false, lessons: [{num:16,title:'海上日出',author:'巴金'},{num:17,title:'记金华的双龙洞',author:'叶圣陶'}], poems: [{title:'独坐敬亭山',author:'李白',content:'众鸟高飞尽，孤云独去闲。\n相看两不厌，只有敬亭山。'}], knowledge: ['了解课文按一定顺序写景物的方法'], writing: '游____' },
  { id: 'chinese_6', num: 6, title: '成长故事', desc: '小英雄雨来、我们家的男子汉、芦花鞋', completed: false, lessons: [{num:18,title:'小英雄雨来'},{num:19,title:'我们家的男子汉',author:'王安忆'},{num:20,title:'芦花鞋',author:'曹文轩'}], poems: [{title:'芙蓉楼送辛渐',author:'王昌龄',content:'寒雨连江夜入吴，平明送客楚山孤。\n洛阳亲友如相问，一片冰心在玉壶。'}], knowledge: ['学习把握长文章的主要内容'], writing: '我学会了____' },
  { id: 'chinese_7', num: 7, title: '人物品质', desc: '古诗三首、文言文二则、诺曼底号遇难记', completed: false, lessons: [{num:21,title:'古诗三首'},{num:22,title:'文言文二则'},{num:23,title:'"诺曼底号"遇难记',author:'雨果'},{num:24,title:'黄继光'},{num:25,title:'挑山工',author:'冯骥才'}], poems: [{title:'塞下曲',author:'卢纶',content:'月黑雁飞高，单于夜遁逃。\n欲将轻骑逐，大雪满弓刀。'}], knowledge: ['从人物的语言、动作等描写中感受人物的品质'], writing: '我的"自画像"' },
  { id: 'chinese_8', num: 8, title: '童话世界', desc: '宝葫芦的秘密、巨人的花园、海的女儿', completed: false, lessons: [{num:26,title:'宝葫芦的秘密',author:'张天翼'},{num:27,title:'巨人的花园',author:'王尔德'},{num:28,title:'海的女儿',author:'安徒生'}], poems: [{title:'卜算子·咏梅',author:'毛泽东',content:'风雨送春归，飞雪迎春到。\n已是悬崖百丈冰，犹有花枝俏。\n俏也不争春，只把春来报。\n待到山花烂漫时，她在丛中笑。'}], knowledge: ['感受童话的奇妙，体会人物真善美的形象'], writing: '故事新编' },
]

const poems = ref([
  { id: 'chinese_poem_1', title: '四时田园杂兴（其二十五）', author: '范成大', content: '梅子金黄杏子肥，麦花雪白菜花稀。\n日长篱落无人过，惟有蜻蜓蛱蝶飞。', completed: false, showContent: false },
  { id: 'chinese_poem_2', title: '宿新市徐公店', author: '杨万里', content: '篱落疏疏一径深，树头新绿未成阴。\n儿童急走追黄蝶，飞入菜花无处寻。', completed: false, showContent: false },
  { id: 'chinese_poem_3', title: '清平乐·村居', author: '辛弃疾', content: '茅檐低小，溪上青青草。醉里吴音相媚好，白发谁家翁媪？\n大儿锄豆溪东，中儿正织鸡笼。最喜小儿亡赖，溪头卧剥莲蓬。', completed: false, showContent: false },
  { id: 'chinese_poem_4', title: '江畔独步寻花', author: '杜甫', content: '黄师塔前江水东，春光懒困倚微风。\n桃花一簇开无主，可爱深红爱浅红？', completed: false, showContent: false },
  { id: 'chinese_poem_5', title: '蜂', author: '罗隐', content: '不论平地与山尖，无限风光尽被占。\n采得百花成蜜后，为谁辛苦为谁甜？', completed: false, showContent: false },
  { id: 'chinese_poem_6', title: '独坐敬亭山', author: '李白', content: '众鸟高飞尽，孤云独去闲。\n相看两不厌，只有敬亭山。', completed: false, showContent: false },
  { id: 'chinese_poem_7', title: '芙蓉楼送辛渐', author: '王昌龄', content: '寒雨连江夜入吴，平明送客楚山孤。\n洛阳亲友如相问，一片冰心在玉壶。', completed: false, showContent: false },
  { id: 'chinese_poem_8', title: '塞下曲', author: '卢纶', content: '月黑雁飞高，单于夜遁逃。\n欲将轻骑逐，大雪满弓刀。', completed: false, showContent: false },
])

const poemCompletedCount = computed(() => poems.value.filter(p => p.completed).length)

async function togglePoem(poem, idx) {
  try {
    const newStatus = !poem.completed
    const progressKey = `chinese_poem_${idx + 1}`
    if (newStatus) {
      await markProgress('chinese_poem', idx + 1)
    } else {
      await unmarkProgress('chinese_poem', idx + 1)
    }
    poem.completed = newStatus
  } catch (e) {
    console.error('标记古诗词失败:', e)
  }
}

async function loadPoemProgress() {
  try {
    const data = await getProgress()
    const doneUnits = data.doneUnits || []
    poems.value.forEach((poem, idx) => {
      poem.completed = doneUnits.includes(`chinese_poem_${idx + 1}`)
    })
    // 同时加载单元完成状态
    units.value.forEach(unit => {
      unit.completed = doneUnits.includes(unit.id)
    })
  } catch (e) {
    console.error('加载古诗词进度失败:', e)
  }
}

function openUnit(unit) {
  selectedUnit.value = unit
}

async function toggleUnitComplete(unit) {
  try {
    const unitNum = unit.id.replace('chinese_', '')
    if (unit.completed) {
      await unmarkProgress('chinese', unitNum)
      unit.completed = false
    } else {
      await markProgress('chinese', unitNum)
      unit.completed = true
    }
  } catch (e) {
    console.error('标记单元完成失败:', e)
  }
}
</script>

<style scoped>
/* 每日五字 */
.daily-chars-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.chars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.char-card {
  background: var(--surface2);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.char-card.practiced {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.08);
}

.char-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.char-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent-dim);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.char-check {
  font-size: 16px;
}

.char-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
}

.char-char {
  font-size: 48px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
}

.char-pinyin {
  font-size: 14px;
  color: var(--accent);
  font-weight: 500;
}

.char-info {
  width: 100%;
  text-align: center;
  margin-bottom: 12px;
}

.char-meta {
  display: flex;
  justify-content: center;
  gap: 12px;
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 8px;
}

.char-words {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  margin-bottom: 8px;
}

.word-tag {
  background: var(--accent-dim);
  color: var(--accent);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.char-sentence {
  font-size: 12px;
  color: var(--text2);
  line-height: 1.6;
}

.practice-btn {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.practice-btn:hover {
  opacity: 0.9;
}

.practice-btn.active {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}

.daily-progress {
  text-align: center;
  font-size: 14px;
  color: var(--text2);
  padding: 8px;
  background: var(--surface2);
  border-radius: 8px;
}

.loading-state, .error-state {
  text-align: center;
  padding: 20px;
  color: var(--text2);
}

.error-state {
  color: #ef4444;
}

/* 错字难字按钮 */
.section-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.difficult-btn {
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.difficult-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.history-btn {
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  color: #3b82f6;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.history-btn:hover {
  background: rgba(59, 130, 246, 0.2);
}

.char-badges {
  display: flex;
  align-items: center;
  gap: 4px;
}

.char-difficult-badge {
  font-size: 12px;
}

.difficult-toggle-btn {
  width: 100%;
  padding: 6px;
  margin-top: 6px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text2);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.difficult-toggle-btn:hover {
  background: var(--surface3);
}

.difficult-toggle-btn.active {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.char-card.difficult {
  border-color: rgba(239, 68, 68, 0.3);
}

/* 错字难字弹窗 */
.difficult-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.difficult-card {
  border: 2px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.remove-difficult-btn {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-difficult-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text2);
}

.empty-state p {
  margin: 0;
}

.empty-hint {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.7;
}

/* 练字历史弹窗 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.history-day {
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
}

.history-day:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.history-date {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.date-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.date-weekday {
  font-size: 12px;
  color: var(--text2);
}

.date-today {
  padding: 2px 8px;
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 4px;
  color: #4ade80;
  font-size: 11px;
  font-weight: 500;
}

.history-chars {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.history-char-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 14px;
  background: var(--surface2);
  border-radius: 10px;
  border: 2px solid transparent;
  min-width: 64px;
}

.history-char-card.practiced {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.05);
}

.history-char-card.difficult {
  border-color: rgba(239, 68, 68, 0.3);
}

.history-char {
  font-size: 32px;
  font-weight: 700;
  color: var(--text);
}

.history-pinyin {
  font-size: 12px;
  color: var(--accent);
  margin-top: 2px;
}

.history-practiced,
.history-difficult {
  font-size: 10px;
  margin-top: 2px;
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

/* 单元完成按钮 */
.complete-action {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid var(--border);
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
  border: 2px solid transparent;
  transition: all 0.2s;
}

.poem-card.completed {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.08);
}

.poem-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.poem-complete-btn {
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text2);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.poem-complete-btn:hover {
  background: var(--surface3);
}

.poem-complete-btn.active {
  background: rgba(74, 222, 128, 0.2);
  border-color: #4ade80;
  color: #4ade80;
}

.poem-toggle-btn {
  margin-top: 10px;
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  background: var(--accent-dim);
  color: var(--accent);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.poem-toggle-btn:hover {
  opacity: 0.8;
}

.poem-content.hidden {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  .units-grid {
    grid-template-columns: 1fr;
  }
}
</style>
