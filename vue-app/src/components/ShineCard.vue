<template>
  <div class="shine-card" @click="$emit('open', shine)">
    <!-- 照片网格 -->
    <div class="shine-photo">
      <div 
        v-if="photos.length > 0" 
        class="photo-grid" 
        :class="'grid-' + Math.min(photos.length, 4)"
      >
        <img
          v-for="(url, idx) in photos.slice(0, 4)"
          :key="idx"
          :src="url"
          class="photo-img"
          :alt="'photo ' + (idx + 1)"
        >
        <div v-if="photos.length > 4" class="photo-more">
          +{{ photos.length - 4 }}
        </div>
      </div>
      <span v-else class="photo-icon">{{ icon }}</span>
    </div>

    <!-- 信息 -->
    <div class="shine-info">
      <h4 class="shine-title">{{ shine.title }}</h4>
      <p class="shine-date">{{ shine.date }}</p>
      <p v-if="shine.desc" class="shine-desc">{{ shine.desc }}</p>
      <span v-if="photos.length > 1" class="photo-count">
        📷 {{ photos.length }}张
      </span>
    </div>

    <!-- 操作（右上角浮动） -->
    <div class="shine-actions" @click.stop>
      <button class="shine-fav" :class="{ active: shine.fav }" @click="$emit('fav')">
        {{ shine.fav ? '⭐' : '☆' }}
      </button>
      <button class="shine-edit" @click="$emit('edit')">✏️</button>
      <button class="shine-delete" @click="$emit('delete')">🗑️</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  shine: { type: Object, required: true },
  icon: { type: String, default: '✨' }
})

defineEmits(['open', 'fav', 'edit', 'delete'])

const photos = computed(() => {
  if (!props.shine.photos) return []
  try {
    return typeof props.shine.photos === 'string' 
      ? JSON.parse(props.shine.photos) 
      : props.shine.photos
  } catch {
    return props.shine.photoUrl ? [props.shine.photoUrl] : []
  }
})
</script>

<style scoped>
.shine-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  position: relative;
}

.shine-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.shine-photo {
  aspect-ratio: 4/3;
  background: linear-gradient(135deg, var(--surface2), var(--surface3));
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.photo-grid {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 2px;
}

.grid-1 { grid-template-columns: 1fr; }
.grid-2 { grid-template-columns: 1fr 1fr; }
.grid-3 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
.grid-3 .photo-img:first-child {
  grid-column: 1 / -1;
}
.grid-4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.shine-card:hover .photo-img {
  transform: scale(1.05);
}

.photo-more {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 6px;
}

.photo-icon {
  font-size: 48px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.shine-info {
  padding: 14px;
  cursor: pointer;
}

.shine-title {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.shine-date {
  margin: 0 0 6px;
  font-size: 12px;
  color: var(--text2);
}

.shine-desc {
  margin: 0 0 4px;
  font-size: 13px;
  color: var(--text2);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.photo-count {
  display: inline-block;
  font-size: 12px;
  color: var(--text3);
  margin-top: 4px;
}

.shine-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 6px;
}

.shine-actions button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0;
  transform: scale(0.8);
}

.shine-card:hover .shine-actions button {
  opacity: 1;
  transform: scale(1);
}

.shine-actions button:hover {
  background: rgba(0, 0, 0, 0.6);
  transform: scale(1.1);
}

.shine-fav.active {
  opacity: 1 !important;
  transform: scale(1) !important;
}
</style>