<template>
  <div class="home-view">
    <div class="home-split-layout">

      <!-- 左栏：徽章 + 吉他 -->
      <div class="home-left-col">
        <BadgeGrid :badges="badges" :unlockedBadges="unlockedBadges" />
        <GuitarVideo :video="latestGuitarVideo" />
      </div>

      <!-- 右栏：主内容 -->
      <div class="home-right-col">
        <HeroWelcome
          :greeting="greeting"
          :todayDate="todayDate"
          :dailyQuote="dailyQuote"
          :stats="stats"
          :unlockedBadges="unlockedBadges"
        />

        <div class="two-column">
          <TaskList
            :tasks="tasks"
            :completedTasks="completedTasks"
            :allTasksDone="allTasksDone"
            @toggle="toggleTask"
          />
          <StudyProgress :subjects="subjects" />
        </div>

        <PhotoWall :photos="displayPhotos" @open="openPhotoModal" />
      </div>
    </div>

    <PhotoModal :photo="selectedPhoto" @close="selectedPhoto = null" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDiary, getShines, getGuitar, getTech, getProgress } from '../utils/api.js'

import BadgeGrid from '../components/BadgeGrid.vue'
import GuitarVideo from '../components/GuitarVideo.vue'
import HeroWelcome from '../components/HeroWelcome.vue'
import TaskList from '../components/TaskList.vue'
import StudyProgress from '../components/StudyProgress.vue'
import PhotoWall from '../components/PhotoWall.vue'
import PhotoModal from '../components/PhotoModal.vue'

import { useBadges } from '../composables/useBadges.js'
import { useTasks } from '../composables/useTasks.js'
import { useHomeData } from '../composables/useHomeData.js'

// 数据
const diary = ref([])
const shines = ref([])
const guitar = ref([])
const tech = ref([])
const progress = ref({})

// 徽章
const { badges, unlockedBadges } = useBadges(diary, shines, guitar, tech, progress)

// 任务
const { tasks, toggleTask, completedTasks, allTasksDone } = useTasks()

// 首页数据
const { stats, subjects } = useHomeData(diary, shines, guitar, progress)

// 问候语
const { greeting, todayDate, dailyQuote } = useGreeting()

// 最新吉他视频
const latestGuitarVideo = computed(() => {
  if (guitar.value?.videos?.length) {
    return guitar.value.videos[guitar.value.videos.length - 1]
  }
  if (guitar.value?.length) {
    const v = guitar.value[guitar.value.length - 1]
    return { title: v.title || '吉他练习', date: v.date, url: v.videoUrl || v.url }
  }
  return null
})

// 照片墙数据
const displayPhotos = computed(() => {
  const photos = []
  shines.value.forEach(shine => {
    if (shine.photos) {
      try {
        const shinePhotos = typeof shine.photos === 'string' ? JSON.parse(shine.photos) : shine.photos
        shinePhotos.forEach(p => {
          if (photos.length < 8) {
            photos.push({ url: p, title: shine.title, date: shine.date, icon: shine.icon || '✨' })
          }
        })
      } catch (e) {
        if (photos.length < 8 && shine.photoUrl) {
          photos.push({ url: shine.photoUrl, title: shine.title, date: shine.date, icon: shine.icon || '✨' })
        }
      }
    } else if (shine.photoUrl && photos.length < 8) {
      photos.push({ url: shine.photoUrl, title: shine.title, date: shine.date, icon: shine.icon || '✨' })
    }
  })
  const placeholders = [
    { title: '期待更多美好', icon: '✨' },
    { title: '记录精彩瞬间', icon: '📸' },
    { title: '分享你的故事', icon: '🌟' },
  ]
  while (photos.length < 3) {
    const p = placeholders[photos.length % placeholders.length]
    photos.push({ url: '', title: p.title, icon: p.icon })
  }
  return photos
})

const selectedPhoto = ref(null)
function openPhotoModal(photo) {
  selectedPhoto.value = photo
}

// 加载数据
onMounted(async () => {
  try {
    const [d, s, g, t, p] = await Promise.all([
      getDiary().catch(() => []),
      getShines().catch(() => []),
      getGuitar().catch(() => []),
      getTech().catch(() => []),
      getProgress().catch(() => ({}))
    ])
    diary.value = d
    shines.value = s
    guitar.value = g
    tech.value = t
    progress.value = p
  } catch (e) {
    console.error('加载首页数据失败:', e)
  }
})
</script>

<style scoped>
.home-view {
  width: 100%;
  max-width: 100%;
  padding: 50px 12px 0;
  box-sizing: border-box;
}

/* 左右分栏 */
.home-split-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  align-items: start;
}

.home-left-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.home-right-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 两列布局 */
.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .home-split-layout {
    grid-template-columns: 1fr;
  }
  .home-left-col {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .home-left-col > * {
    flex: 1;
    min-width: 280px;
  }
}

@media (max-width: 768px) {
  .two-column {
    grid-template-columns: 1fr;
  }
}
</style>
