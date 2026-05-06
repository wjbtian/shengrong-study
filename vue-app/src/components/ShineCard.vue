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

    <!-- 操作 -->
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
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.shine-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.shine-photo {
  aspect-ratio: 4/3;
  background: var(--surface2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-grid {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 2px;
}

.grid-1 { grid-template-columns: 1fr; }
.grid-2 { grid-template-columns: 1fr 1fr; }
.grid-3 { grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 1fr; }
.grid-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-more {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  grid-column: 2;
  grid-row: 2;
}

.photo-icon {
  font-size: 48px;
  opacity: 0.3;
}

.shine-info {
  padding: 12px;
}

.shine-title {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.shine-date {
  margin: 0;
  font-size: 12px;
  color: var(--text3);
}

.shine-desc {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--text2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.photo-count {
  display: inline-block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text3);
}

.shine-actions {
  display: flex;
  gap: 4px;
  padding: 0 12px 12px;
}

.shine-actions button {
  padding: 6px 10px;
  background: var(--surface2);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.shine-actions button:hover {
  background: var(--accent-dim);
}

.shine-fav.active {
  color: #fbbf24;
}
</style>