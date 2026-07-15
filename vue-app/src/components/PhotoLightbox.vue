<template>
  <div v-if="item" class="lightbox" @click.self="$emit('close')">
    <button class="lightbox-close" @click="$emit('close')">✕</button>

    <!-- 上一张 -->
    <button v-if="index > 0" class="lightbox-nav lightbox-prev" @click="index--">‹</button>

    <div class="lightbox-content" @click.stop>
      <div class="lightbox-photo">
        <img v-if="photos[index]" :src="photos[index]" class="lightbox-img" alt="">
      </div>
      <div class="lightbox-info">
        <h3>{{ item.title }}</h3>
        <p>{{ item.date }}</p>
        <p v-if="item.desc">{{ item.desc }}</p>
      </div>
      <!-- 缩略图 -->
      <div v-if="photos.length > 1" class="lightbox-thumbs">
        <img
          v-for="(url, idx) in photos"
          :key="idx"
          :src="url"
          class="lightbox-thumb"
          :class="{ active: idx === index }"
          @click="index = idx"
        >
      </div>
      <!-- 计数器 -->
      <p v-if="photos.length > 1" class="lightbox-counter">
        {{ index + 1 }} / {{ photos.length }}
      </p>
    </div>

    <!-- 下一张 -->
    <button v-if="index < photos.length - 1" class="lightbox-nav lightbox-next" @click="index++">›</button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  item: { type: Object, default: null }
})

defineEmits(['close'])

const index = ref(0)

const photos = computed(() => {
  if (!props.item) return []
  try {
    return typeof props.item.photos === 'string' 
      ? JSON.parse(props.item.photos) 
      : props.item.photos || []
  } catch {
    return props.item.photoUrl ? [props.item.photoUrl] : []
  }
})

// 重置索引
watch(() => props.item, () => { index.value = 0 })
</script>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  font-size: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
}

.lightbox-content {
  max-width: 80vw;
  max-height: 80vh;
  text-align: center;
  color: white;
}

.lightbox-photo {
  max-height: 60vh;
  margin-bottom: 16px;
}

.lightbox-img {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 8px;
}

.lightbox-info h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
}

.lightbox-info p {
  margin: 0 0 4px;
  font-size: 14px;
  opacity: 0.7;
}

.lightbox-thumbs {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
}

.lightbox-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.2s;
}

.lightbox-thumb.active,
.lightbox-thumb:hover {
  opacity: 1;
  transform: scale(1.1);
}

.lightbox-counter {
  margin: 12px 0 0;
  font-size: 14px;
  opacity: 0.7;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  font-size: 48px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.lightbox-nav:hover {
  background: rgba(255,255,255,0.2);
}

.lightbox-prev { left: 20px; }
.lightbox-next { right: 20px; }
</style>