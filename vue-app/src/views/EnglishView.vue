<template>
  <SubjectLayout
    icon="🌍"
    title="英语学习"
    subtitle="译林版四年级下册 · 8个单元 · 情景式学习"
    color="#f472b6"
    :progressPercent="progressPercent"
    :doneCount="doneCount"
    :total="8"
    unitLabel="单元"
    :stats="[{ value: 40, label: '单词' }, { value: 16, label: '对话' }, { value: 0, label: '听力' }]"
  >
    <!-- 单元情景 -->
    <section class="scenes-section">
      <div class="section-header">
        <h2 class="section-title">🎭 单元情景</h2>
        <span class="section-subtitle">点击场景进入学习</span>
      </div>
      <div class="scenes-grid">
        <div
          v-for="scene in scenes"
          :key="scene.id"
          class="scene-card"
          :class="{ completed: scene.completed }"
          @click="openScene(scene)"
        >
          <div class="scene-icon">{{ scene.icon }}</div>
          <h3 class="scene-title">{{ scene.title }}</h3>
          <p class="scene-desc">{{ scene.desc }}</p>
          <div class="scene-words">
            <span v-for="word in scene.words" :key="word" class="scene-word">{{ word }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 单词卡片 -->
    <section class="vocab-section">
      <div class="section-header">
        <h2 class="section-title">🎴 单词卡片</h2>
        <span class="section-subtitle">点击翻转查看释义</span>
      </div>
      <div class="vocab-grid">
        <div
          v-for="word in vocab"
          :key="word.en"
          class="vocab-card"
          :class="{ flipped: word.flipped }"
          @click="word.flipped = !word.flipped"
        >
          <div class="vocab-front">
            <span class="vocab-en">{{ word.en }}</span>
            <span class="vocab-phonetic">{{ word.phonetic }}</span>
          </div>
          <div class="vocab-back">
            <span class="vocab-cn">{{ word.cn }}</span>
            <span class="vocab-type">{{ word.type }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 情景对话 -->
    <section class="dialogue-section">
      <div class="section-header">
        <h2 class="section-title">💬 情景对话</h2>
        <span class="section-subtitle">重点句型与表达</span>
      </div>
      <div class="dialogue-list">
        <div v-for="(dialogue, idx) in dialogues" :key="idx" class="dialogue-card">
          <h4 class="dialogue-title">{{ dialogue.title }}</h4>
          <div class="dialogue-content">
            <div v-for="(line, i) in dialogue.lines" :key="i" class="dialogue-line" :class="line.speaker">
              <span class="speaker">{{ line.speaker }}:</span>
              <span class="text">{{ line.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 听力记录 -->
    <section class="listening-section">
      <div class="section-header">
        <h2 class="section-title">🎧 听力记录</h2>
        <span class="section-subtitle">记录听力练习情况</span>
      </div>
      <div class="listening-empty">
        <div class="listening-empty-icon">🎵</div>
        <p>暂无听力记录</p>
        <span class="listening-hint">在微信对话中告诉我听力练习情况</span>
      </div>
    </section>
  </SubjectLayout>
</template>

<script setup>
import { ref } from 'vue'
import SubjectLayout from '../components/SubjectLayout.vue'
import { useSubjectProgress } from '../composables/useSubjectProgress.js'

const { doneCount, progressPercent } = useSubjectProgress('english_', 8)

const scenes = ref([
  { id: 'english_1', icon: '🏫', title: 'Our School Subjects', desc: '谈论学校课程', completed: false, words: ['Maths', 'English', 'Chinese', 'PE'] },
  { id: 'english_2', icon: '🕐', title: 'After School', desc: '课后活动安排', completed: false, words: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'] },
  { id: 'english_3', icon: '🔢', title: 'How Many?', desc: '询问数量', completed: false, words: ['thirteen', 'fourteen', 'fifteen', 'sixteen'] },
  { id: 'english_4', icon: '📅', title: 'Drawing in the Park', desc: '公园画画', completed: false, words: ['draw', 'park', 'river', 'boat'] },
  { id: 'english_5', icon: '🌳', title: 'Seasons', desc: '四季变化', completed: false, words: ['spring', 'summer', 'autumn', 'winter'] },
  { id: 'english_6', icon: '👕', title: 'Whose Dress Is This?', desc: '衣物归属', completed: false, words: ['dress', 'coat', 'shirt', 'sweater'] },
  { id: 'english_7', icon: '🌡️', title: 'What\'s the Matter?', desc: '询问状况', completed: false, words: ['tired', 'ill', 'hungry', 'thirsty'] },
  { id: 'english_8', icon: '🏠', title: 'How Are You?', desc: '问候与告别', completed: false, words: ['fine', 'well', 'good', 'bye'] },
])

const vocab = ref([
  { en: 'Maths', phonetic: '/mæθs/', cn: '数学', type: 'n.', flipped: false },
  { en: 'English', phonetic: '/ˈɪŋɡlɪʃ/', cn: '英语', type: 'n.', flipped: false },
  { en: 'Chinese', phonetic: '/ˌtʃaɪˈniːz/', cn: '语文', type: 'n.', flipped: false },
  { en: 'PE', phonetic: '/ˌpiː ˈiː/', cn: '体育', type: 'n.', flipped: false },
  { en: 'Monday', phonetic: '/ˈmʌndeɪ/', cn: '星期一', type: 'n.', flipped: false },
  { en: 'Tuesday', phonetic: '/ˈtjuːzdeɪ/', cn: '星期二', type: 'n.', flipped: false },
  { en: 'Wednesday', phonetic: '/ˈwenzdeɪ/', cn: '星期三', type: 'n.', flipped: false },
  { en: 'Thursday', phonetic: '/ˈθɜːzdeɪ/', cn: '星期四', type: 'n.', flipped: false },
])

const dialogues = ref([
  {
    title: '谈论课程',
    lines: [
      { speaker: 'A', text: 'What subjects do you like?' },
      { speaker: 'B', text: 'I like Maths and English.' },
      { speaker: 'A', text: 'What about you?' },
      { speaker: 'B', text: 'I like PE. It\'s fun.' },
    ]
  },
  {
    title: '询问时间',
    lines: [
      { speaker: 'A', text: 'When do you get up?' },
      { speaker: 'B', text: 'I get up at six.' },
      { speaker: 'A', text: 'What time is it now?' },
      { speaker: 'B', text: 'It\'s seven o\'clock.' },
    ]
  },
])

function openScene(scene) {
  // 可以展开单元详情
}
</script>

<style scoped>
/* 单元情景 */
.scenes-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.scenes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.scene-card {
  padding: 20px;
  background: var(--surface2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.scene-card:hover {
  transform: translateY(-4px);
  background: var(--surface3);
}

.scene-card.completed {
  border-color: #f472b6;
}

.scene-icon {
  font-size: 36px;
  margin-bottom: 10px;
}

.scene-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.scene-desc {
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 10px;
}

.scene-words {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.scene-word {
  font-size: 11px;
  padding: 3px 8px;
  background: var(--surface);
  border-radius: 4px;
  color: var(--text2);
}

/* 单词卡片 */
.vocab-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.vocab-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.vocab-card {
  aspect-ratio: 1;
  background: var(--surface2);
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.4s;
}

.vocab-card.flipped {
  transform: rotateY(180deg);
}

.vocab-front, .vocab-back {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  backface-visibility: hidden;
  padding: 16px;
}

.vocab-back {
  transform: rotateY(180deg);
  background: linear-gradient(135deg, rgba(244, 114, 182, 0.1), rgba(129, 140, 248, 0.1));
  border-radius: 12px;
}

.vocab-en {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.vocab-phonetic {
  font-size: 12px;
  color: var(--text2);
}

.vocab-cn {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.vocab-type {
  font-size: 12px;
  color: var(--text2);
}

/* 对话 */
.dialogue-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.dialogue-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialogue-card {
  padding: 16px;
  background: var(--surface2);
  border-radius: 10px;
}

.dialogue-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 10px;
}

.dialogue-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dialogue-line {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.dialogue-line .speaker {
  font-weight: 600;
  color: var(--accent);
  min-width: 24px;
}

.dialogue-line .text {
  color: var(--text);
}

/* 听力 */
.listening-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}

.listening-empty {
  text-align: center;
  padding: 40px;
}

.listening-empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.listening-empty p {
  font-size: 16px;
  color: var(--text);
  margin-bottom: 8px;
}

.listening-hint {
  font-size: 13px;
  color: var(--text2);
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
  .scenes-grid, .vocab-grid {
    grid-template-columns: 1fr;
  }
}
</style>
