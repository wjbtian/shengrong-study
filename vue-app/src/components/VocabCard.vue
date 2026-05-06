<template>
  <div
    class="vocab-card"
    :class="{ flipped: word.flipped }"
    @click="word.flipped = !word.flipped"
  >
    <div class="vocab-front">
      <span class="vocab-en">{{ word.en }}</span>
      <span class="vocab-phonetic">{{ word.phonetic }}</span>
      <button class="vocab-speak" @click.stop="speak(word.en)" title="点击发音">
        🔊
      </button>
    </div>
    <div class="vocab-back">
      <span class="vocab-cn">{{ word.cn }}</span>
      <span class="vocab-type">{{ word.type }}</span>
      <span class="vocab-example">{{ word.example }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  word: { type: Object, required: true }
})

function speak(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }
}
</script>

<style scoped>
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

.vocab-front {
  position: relative;
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

.vocab-speak {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(244, 114, 182, 0.2);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vocab-speak:hover {
  background: rgba(244, 114, 182, 0.4);
  transform: scale(1.1);
}

.vocab-example {
  font-size: 11px;
  color: var(--text3);
  text-align: center;
  line-height: 1.4;
  padding: 0 8px;
  font-style: italic;
}
</style>
