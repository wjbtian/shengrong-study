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
    :stats="[{ value: 64, label: '单词' }, { value: 16, label: '对话' }, { value: 0, label: '听力' }]"
  >
    <!-- 单词卡片 -->
    <section class="vocab-section">
      <SectionHeader icon="🎴" title="单词卡片" subtitle="点击翻转查看释义，🔊 点击发音" />
      
      <!-- 单元选择器 -->
      <UnitSelector v-model="currentUnit" :units="vocabUnits" />
      
      <!-- 当前单元信息 -->
      <div class="unit-info">
        <template v-if="currentUnit === -1">
          <span class="unit-info-title">📚 全部单词</span>
          <span class="unit-info-desc">8个单元 · 共 {{ allWordsCount }} 个单词</span>
        </template>
        <template v-else>
          <span class="unit-info-title">{{ vocabUnits[currentUnit].icon }} {{ vocabUnits[currentUnit].title }}</span>
          <span class="unit-info-desc">{{ vocabUnits[currentUnit].desc }}</span>
          <span class="unit-info-words">{{ vocabUnits[currentUnit].words.length }} 个单词 · {{ vocabUnits[currentUnit].dialogues.length }} 组对话</span>
        </template>
      </div>
      
      <!-- 单词网格 -->
      <div class="vocab-grid">
        <VocabCard
          v-for="word in currentWords"
          :key="word.en"
          :word="word"
        />
      </div>
    </section>

    <!-- 情景对话 -->
    <section class="dialogue-section" v-if="currentUnit !== -1">
      <SectionHeader icon="💬" title="情景对话" :subtitle="vocabUnits[currentUnit].title + ' 重点句型'" />
      <div class="dialogue-list">
        <DialogueCard
          v-for="(dialogue, idx) in vocabUnits[currentUnit].dialogues"
          :key="idx"
          :dialogue="dialogue"
        />
      </div>
    </section>

    <!-- 听力记录 -->
    <section class="listening-section">
      <SectionHeader icon="🎧" title="听力记录" subtitle="记录听力练习情况" />
      <div class="listening-empty">
        <div class="listening-empty-icon">🎵</div>
        <p>暂无听力记录</p>
        <span class="listening-hint">在微信对话中告诉我听力练习情况</span>
      </div>
    </section>
  </SubjectLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import SubjectLayout from '../components/SubjectLayout.vue'
import SectionHeader from '../components/SectionHeader.vue'
import UnitSelector from '../components/UnitSelector.vue'
import VocabCard from '../components/VocabCard.vue'
import DialogueCard from '../components/DialogueCard.vue'
import { useSubjectProgress } from '../composables/useSubjectProgress.js'
import { useVocabData } from '../composables/useVocabData.js'

const { doneCount, progressPercent } = useSubjectProgress('english_', 8)
const { currentUnit, vocabUnits, allWordsCount, currentWords } = useVocabData()
</script>

<style scoped>
.vocab-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.unit-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(244, 114, 182, 0.08), rgba(129, 140, 248, 0.08));
  border-radius: 8px;
  margin-bottom: 16px;
}

.unit-info-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.unit-info-desc {
  font-size: 12px;
  color: var(--text2);
}

.unit-info-words {
  font-size: 11px;
  color: var(--accent);
  background: rgba(244, 114, 182, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
  margin-left: auto;
}

.vocab-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

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

@media (max-width: 768px) {
  .vocab-grid {
    grid-template-columns: 1fr;
  }
}
</style>
