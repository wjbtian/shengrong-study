<template>
  <div v-if="photo" class="photo-modal" @click.self="$emit('close')">
    <div class="photo-modal-content">
      <button class="photo-modal-close" @click="$emit('close')">✕</button>
      <div class="photo-modal-image">
        <img v-if="photo.url" :src="photo.url" :alt="photo.title" />
        <span v-else class="photo-modal-emoji">{{ photo.icon || '✨' }}</span>
      </div>
      <h3>{{ photo.title }}</h3>
      <p>{{ photo.date }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  photo: { type: Object, default: null }
})
defineEmits(['close'])
</script>

<style scoped>
.photo-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 40px;
}

.photo-modal-content {
  text-align: center;
  color: var(--text);
  max-width: 80vw;
  max-height: 80vh;
  position: relative;
}

.photo-modal-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: var(--text);
  font-size: 24px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.1);
}

.photo-modal-image {
  max-width: 600px;
  max-height: 60vh;
  margin: 0 auto 20px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--surface);
}

.photo-modal-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.photo-modal-emoji {
  font-size: 120px;
  display: block;
  padding: 40px;
}

h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

p {
  margin: 0;
  font-size: 14px;
  color: var(--text2);
}
</style>