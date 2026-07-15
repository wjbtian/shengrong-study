<template>
  <section class="photo-wall-section">
    <div class="section-header">
      <h2>✨ 闪光时刻</h2>
      <button class="btn-text" @click="$router.push('/shines')">查看全部 →</button>
    </div>
    <div class="photo-wall">
      <div
        v-for="(photo, idx) in photos"
        :key="idx"
        class="wall-photo"
        :class="{ 'has-image': photo.url }"
        @click="$emit('open', photo)"
      >
        <img v-if="photo.url" :src="photo.url" :alt="photo.title" />
        <div v-else class="photo-placeholder">
          <span class="photo-emoji">{{ photo.icon || '✨' }}</span>
        </div>
        <div class="photo-overlay">
          <span class="photo-title">{{ photo.title }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  photos: {
    type: Array,
    default: () => []
  }
})
defineEmits(['open'])
</script>

<style scoped>
.photo-wall-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.btn-text {
  background: none;
  border: none;
  color: var(--accent);
  font-size: 13px;
  cursor: pointer;
}

.btn-text:hover {
  text-decoration: underline;
}

.photo-wall {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.wall-photo {
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  background: var(--surface2);
  cursor: pointer;
  transition: all 0.3s;
}

.wall-photo:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(74, 222, 128, 0.15);
}

.wall-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--surface2), var(--surface3));
}

.photo-emoji {
  font-size: 28px;
  opacity: 0.4;
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.wall-photo:hover .photo-overlay {
  opacity: 1;
}

.photo-title {
  color: white;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

@media (max-width: 768px) {
  .photo-wall {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .photo-wall {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>