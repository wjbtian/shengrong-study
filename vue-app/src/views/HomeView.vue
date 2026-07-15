<template>
  <div class="home-view">
    <!-- ═══ Hero 区：银河问候 ═══ -->
    <section class="hero-galaxy">
      <div class="hero-bg-orb"></div>
      <div class="hero-bg-orb orb-2"></div>

      <div class="hero-main">
        <div class="hero-greeting-section">
          <div class="hero-tagline">
            <span class="hero-badge pulse-badge">✨ 今日星球</span>
            <span class="hero-date">{{ todayDate }}</span>
          </div>
          <h1 class="hero-title">
            <span class="hero-greeting-text">{{ greeting }}，</span>
            <span class="hero-name-glow">{{ userStore.displayName || '尚融' }}</span>
            <span class="hero-suffix">！</span>
          </h1>
          <div class="hero-quote" v-if="dailyQuote">
            <span class="hero-quote-mark">"</span>
            <div class="hero-quote-body">
              <p class="hero-quote-text">{{ dailyQuote.text }}</p>
              <span class="hero-quote-author">—— {{ dailyQuote.author }}</span>
            </div>
          </div>
        </div>

        <div class="hero-stats-panel">
          <div class="hero-stat-card" v-for="(s, i) in heroStatsData" :key="i"
            :style="{ '--stat-color': s.color, '--stat-delay': i * 0.1 + 's' }">
            <div class="hsc-value">{{ s.value }}</div>
            <div class="hsc-label">{{ s.label }}</div>
            <div class="hsc-icon">{{ s.icon }}</div>
            <div class="hsc-glow"></div>
          </div>
        </div>
      </div>

      <div class="hero-mission-bar">
        <div class="mission-chip" v-for="m in missions" :key="m.label">
          <span class="mc-icon">{{ m.icon }}</span>
          <span class="mc-text">{{ m.label }}</span>
        </div>
      </div>
    </section>

    <!-- ═══ 学习进度 + 艾宾浩斯 ═══ -->
    <section class="section-progress">
      <SectionHeader icon="📊" title="学习进度" subtitle="每个学科都在进步" />

      <div class="progress-scroll">
        <div class="progress-ring-card" v-for="sub in subjects" :key="sub.key"
          @click="goStudy"
          :style="{ '--sub-color': sub.color }">
          <div class="prc-ring">
            <svg viewBox="0 0 80 80" width="80" height="80">
              <circle class="bg-ring" cx="40" cy="40" r="34"/>
              <circle class="fg-ring" cx="40" cy="40" r="34"
                :style="{ strokeDashoffset: 213.6 - (213.6 * sub.percent / 100) }"/>
            </svg>
            <div class="prc-center">
              <span class="prc-icon">{{ sub.icon }}</span>
              <span class="prc-pct">{{ sub.percent }}%</span>
            </div>
          </div>
          <div class="prc-name">{{ sub.name }}</div>
          <div class="prc-bar">
            <div class="prc-bar-fill" :style="{ width: sub.percent + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- 艾宾浩斯复习提醒 -->
      <div class="review-section" v-if="reviews.length > 0">
        <SectionHeader icon="🔄" title="需要复习" subtitle="艾宾浩斯遗忘曲线提醒" />
        <div class="review-scroll">
          <div class="review-chip" v-for="r in reviews" :key="r.id"
            :class="'rv-' + r.stageType">
            <span class="rv-subject">{{ r.subject }}</span>
            <span class="rv-title">{{ r.title }}</span>
            <span class="rv-stage">{{ r.stage }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ 两列布局 ═══ -->
    <div class="home-split-layout">
      <!-- 左列：徽章 + 吉他 -->
      <div class="home-left-col">
        <!-- 徽章墙 -->
        <section class="section-badges">
          <SectionHeader icon="🏆" title="闪光徽章" subtitle="成长的见证" />
          <BadgeGrid :badges="badges" :unlockedBadges="unlockedBadges" />
        </section>

        <!-- 最近吉他 -->
        <section class="section-guitar" v-if="latestGuitarVideo">
          <SectionHeader icon="🎸" title="吉他练习" subtitle="音乐之旅" />
          <GuitarVideo :video="latestGuitarVideo" />
        </section>
      </div>

      <!-- 右列：主内容 -->
      <div class="home-right-col">
        <!-- 日记时间线 -->
        <section class="section-diary">
          <SectionHeader icon="📔" title="成长日记" subtitle="记录每一天" />
          <div class="diary-timeline">
            <div class="diary-entry" v-for="(entry, i) in diary.slice(0, 5)" :key="entry.id"
              :style="{ animationDelay: i * 0.08 + 's' }">
              <div class="de-marker">
                <div class="de-dot" :style="{ background: moodColor(entry.mood) }"></div>
                <div class="de-line" v-if="i < Math.min(diary.length, 5) - 1"></div>
              </div>
              <div class="de-card glass-card" @click="openDiary(entry)">
                <div class="de-header">
                  <span class="de-mood">{{ entry.mood }}</span>
                  <span class="de-title">{{ entry.title }}</span>
                </div>
                <p class="de-content">{{ entry.content }}</p>
                <div class="de-footer">
                  <span class="de-date">{{ entry.date }}</span>
                </div>
              </div>
            </div>
            <router-link to="/diary" class="diary-more glass-card">
              <span>查看全部 →</span>
            </router-link>
          </div>
        </section>

        <!-- 照片墙 -->
        <section class="section-photos" v-if="displayPhotos.length > 0">
          <SectionHeader icon="📸" title="精彩瞬间" subtitle="用照片记录成长" />
          <div class="photo-masonry">
            <div class="photo-item" v-for="(photo, i) in displayPhotos" :key="i"
              :style="{ '--photo-delay': i * 0.1 + 's' }"
              @click="openPhotoModal(photo)">
              <div class="photo-img-wrap" v-if="photo.url">
                <img :src="photo.url" :alt="photo.title" loading="lazy" />
                <div class="photo-overlay">
                  <span class="po-icon">{{ photo.icon }}</span>
                  <span class="po-title">{{ photo.title }}</span>
                </div>
              </div>
              <div class="photo-placeholder" v-else>
                <span class="pp-icon">{{ photo.icon }}</span>
                <span class="pp-title">{{ photo.title }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 任务列表 -->
        <section class="section-tasks" v-if="tasks.length > 0">
          <SectionHeader icon="✅" title="今日任务" subtitle="完成它们获得成就感" />
          <TaskList
            :tasks="tasks"
            :completedTasks="completedTasks"
            :allTasksDone="allTasksDone"
            @toggle="toggleTask"
          />
        </section>
      </div>
    </div>

    <PhotoModal :photo="selectedPhoto" @close="selectedPhoto = null" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDiary, getShines, getGuitar, getTech, getProgress } from '../utils/api.js'
import { useUserStore } from '../stores/user'

import SectionHeader from '../components/SectionHeader.vue'
import BadgeGrid from '../components/BadgeGrid.vue'
import GuitarVideo from '../components/GuitarVideo.vue'
import TaskList from '../components/TaskList.vue'
import PhotoModal from '../components/PhotoModal.vue'

import { useBadges } from '../composables/useBadges.js'
import { useTasks } from '../composables/useTasks.js'
import { useHomeData, useGreeting } from '../composables/useHomeData.js'

const router = useRouter()
const userStore = useUserStore()

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
// 数据
const { stats, subjects, reviews } = useHomeData(diary, shines, guitar, progress)
// 问候语
const { greeting, todayDate, dailyQuote } = useGreeting()

// Hero 统计
const heroStatsData = computed(() => [
  { value: stats.value.diary, label: '日记', icon: '📔', color: '#4ade80' },
  { value: stats.value.shines, label: '闪光', icon: '✨', color: '#fbbf24' },
  { value: stats.value.guitar, label: '吉他', icon: '🎸', color: '#f472b6' },
  { value: unlockedBadges.value, label: '徽章', icon: '🏆', color: '#818cf8' }
])

// 快捷任务
const missions = computed(() => {
  const items = []
  if (reviews.value.length > 0) items.push({ icon: '🔄', label: `${reviews.value.length} 项待复习` })
  const totalCompleted = subjects.value.reduce((a, s) => a + s.completed, 0)
  const total = subjects.value.reduce((a, s) => a + s.total, 0)
  items.push({ icon: '📚', label: `${totalCompleted}/${total} 单元` })
  items.push({ icon: '⏱️', label: `${stats.value.diary} 篇日记` })
  return items
})

// 最新吉他视频
const latestGuitarVideo = computed(() => {
  if (guitar.value?.videos?.length) return guitar.value.videos[guitar.value.videos.length - 1]
  if (guitar.value?.length) {
    const v = guitar.value[guitar.value.length - 1]
    return { title: v.title || '吉他练习', date: v.date, url: v.videoUrl || v.url }
  }
  return null
})

// 照片墙
const displayPhotos = computed(() => {
  const photos = []
  shines.value.forEach(shine => {
    if (shine.photos) {
      try {
        const p = typeof shine.photos === 'string' ? JSON.parse(shine.photos) : shine.photos
        p.forEach(pp => { if (photos.length < 8) photos.push({ url: pp, title: shine.title, date: shine.date, icon: shine.icon || '✨' }) })
      } catch(e) {
        if (photos.length < 8 && shine.photoUrl) photos.push({ url: shine.photoUrl, title: shine.title, date: shine.date, icon: shine.icon || '✨' })
      }
    } else if (shine.photoUrl && photos.length < 8) {
      photos.push({ url: shine.photoUrl, title: shine.title, date: shine.date, icon: shine.icon || '✨' })
    }
  })
  while (photos.length < 3) {
    const placeholder = ['✨ 期待更多美好', '📸 记录精彩瞬间', '🌟 分享你的故事'][photos.length % 3]
    photos.push({ url: '', title: placeholder, icon: placeholder.split(' ')[0] })
  }
  return photos
})

const selectedPhoto = ref(null)
function openPhotoModal(photo) { selectedPhoto.value = photo }

function moodColor(mood) {
  const m = { '😊':'#4ade80','😄':'#22c55e','🤩':'#16a34a','😐':'#94a3b8','😢':'#64748b','😤':'#f87171','😴':'#cbd5e1','🥳':'#86efac'}
  return m[mood] || '#4ade80'
}

function openDiary(entry) { router.push('/diary') }
function goStudy() { router.push('/study') }

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
  } catch (e) { console.error('加载首页数据失败:', e) }
})
</script>

<style scoped>
.home-view {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 10px 20px 40px;
  animation: homeEnter 0.6s ease;
}

@keyframes homeEnter { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* ═══════════════════════════════════════════
   HERO 银河问候
   ═══════════════════════════════════════════ */
.hero-galaxy {
  position: relative;
  padding: 36px 40px;
  margin-bottom: 32px;
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(74,222,128,0.06) 0%, rgba(129,140,248,0.04) 50%, rgba(244,114,182,0.03) 100%);
  border: 1px solid rgba(255,255,255,0.04);
  overflow: hidden;
}
.hero-bg-orb {
  position: absolute;
  width: 400px; height: 400px;
  border-radius: 50%;
  top: -100px; right: -100px;
  background: radial-gradient(circle, rgba(74,222,128,0.08), transparent 70%);
  pointer-events: none;
  animation: orbFloat 8s ease-in-out infinite;
}
.orb-2 {
  width: 300px; height: 300px;
  bottom: -80px; left: -80px; top: auto; right: auto;
  background: radial-gradient(circle, rgba(129,140,248,0.06), transparent 70%);
  animation-delay: -4s;
  animation-duration: 10s;
}
@keyframes orbFloat { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px,20px) scale(1.05); } }

.hero-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
  position: relative;
  z-index: 1;
}

.hero-greeting-section { flex: 1; }
.hero-tagline {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 16px;
}
.hero-badge {
  display: inline-flex; padding: 4px 14px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(74,222,128,0.15), rgba(129,140,248,0.15));
  font-size: 12px; font-weight: 700; color: var(--accent);
  border: 1px solid rgba(74,222,128,0.15);
}
.pulse-badge { animation: badgePulse 3s ease-in-out infinite; }
@keyframes badgePulse { 0%,100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.1); } 50% { box-shadow: 0 0 0 8px rgba(74,222,128,0); } }
.hero-date { font-size: 13px; color: var(--text2); font-weight: 500; }

.hero-title {
  font-size: 44px;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 18px;
  letter-spacing: -1px;
}
.hero-greeting-text { color: var(--text); }
.hero-name-glow {
  background: linear-gradient(135deg, #4ade80, #22d3ee, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% auto;
  animation: gradient-shift 4s ease infinite;
}
.hero-suffix { color: var(--text); }

.hero-quote {
  display: flex; gap: 10px;
  padding: 16px 20px;
  background: rgba(255,255,255,0.02);
  border-radius: 16px;
  border-left: 3px solid rgba(74,222,128,0.3);
  max-width: 520px;
}
.hero-quote-mark {
  font-size: 28px; color: var(--accent); opacity: 0.4;
  line-height: 1; flex-shrink: 0;
}
.hero-quote-body { flex: 1; }
.hero-quote-text {
  font-size: 15px; color: var(--text);
  font-style: italic; line-height: 1.6;
  margin-bottom: 4px;
}
.hero-quote-author { font-size: 12px; color: var(--text3); }

/* 统计面板 */
.hero-stats-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  flex-shrink: 0;
}
.hero-stat-card {
  position: relative;
  width: 90px; height: 90px;
  border-radius: 20px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 2px;
  transition: all 0.3s var(--ease-spring);
  animation: statAppear 0.5s var(--ease-spring) backwards;
  animation-delay: var(--stat-delay);
  overflow: hidden;
}
.hero-stat-card:hover {
  transform: translateY(-4px) scale(1.02);
  border-color: var(--stat-color);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
@keyframes statAppear { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }

.hsc-icon { position: absolute; top: 8px; right: 8px; font-size: 14px; opacity: 0.3; }
.hsc-value { font-size: 28px; font-weight: 900; color: var(--stat-color); text-shadow: 0 0 20px color-mix(in srgb, var(--stat-color) 30%, transparent); }
.hsc-label { font-size: 11px; color: var(--text2); font-weight: 600; }
.hsc-glow {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 50%, var(--stat-color), transparent 70%);
  opacity: 0; transition: opacity 0.4s;
}
.hero-stat-card:hover .hsc-glow { opacity: 0.08; }

/* 任务条 */
.hero-mission-bar {
  display: flex; gap: 8px; flex-wrap: wrap;
  margin-top: 24px; padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.04);
}
.mission-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  font-size: 12px; color: var(--text2);
  transition: all 0.2s;
}
.mission-chip:hover { background: rgba(255,255,255,0.06); color: var(--text); }
.mc-icon { font-size: 13px; }

/* ═══════════════════════════════════════════
   学习进度
   ═══════════════════════════════════════════ */
.section-progress { margin-bottom: 32px; }

.progress-scroll {
  display: flex; gap: 16px;
  overflow-x: auto; padding: 8px 4px 16px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.progress-scroll::-webkit-scrollbar { display: none; }

.progress-ring-card {
  flex-shrink: 0;
  width: 140px;
  padding: 20px 16px;
  border-radius: 20px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  text-align: center;
  cursor: pointer;
  transition: all 0.35s var(--ease-spring);
  animation: cardAppear 0.5s backwards;
}
.progress-ring-card:hover {
  transform: translateY(-6px);
  border-color: var(--sub-color);
  box-shadow: 0 12px 30px rgba(0,0,0,0.3);
}

.prc-ring { position: relative; display: inline-flex; margin-bottom: 10px; }
.prc-ring svg { transform: rotate(-90deg); }
.prc-ring .bg-ring { fill: none; stroke: rgba(255,255,255,0.04); stroke-width: 4; }
.prc-ring .fg-ring {
  fill: none; stroke: var(--sub-color);
  stroke-width: 4; stroke-linecap: round;
  stroke-dasharray: 213.6;
  transition: stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.prc-center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.prc-icon { font-size: 18px; }
.prc-pct { font-size: 11px; font-weight: 700; color: var(--sub-color); }

.prc-name { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.prc-bar { height: 4px; background: rgba(255,255,255,0.04); border-radius: 2px; overflow: hidden; }
.prc-bar-fill { height: 100%; background: var(--sub-color); border-radius: 2px; transition: width 1s ease; }

/* 复习提醒 */
.review-section { margin-top: 20px; }
.review-scroll { display: flex; gap: 8px; overflow-x: auto; padding: 4px 0 8px; scrollbar-width: none; }
.review-scroll::-webkit-scrollbar { display: none; }
.review-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  font-size: 12px;
  white-space: nowrap; flex-shrink: 0;
}
.rv-success { border-color: rgba(74,222,128,0.2); }
.rv-warning { border-color: rgba(251,191,36,0.2); }
.rv-danger { border-color: rgba(248,113,113,0.2); }
.rv-subject { font-weight: 700; color: var(--text); }
.rv-title { color: var(--text2); }
.rv-stage {
  font-size: 10px; font-weight: 600;
  padding: 2px 8px; border-radius: 8px;
}
.rv-success .rv-stage { background: rgba(74,222,128,0.1); color: #4ade80; }
.rv-warning .rv-stage { background: rgba(251,191,36,0.1); color: #fbbf24; }
.rv-danger .rv-stage { background: rgba(248,113,113,0.1); color: #f87171; }

/* ═══════════════════════════════════════════
   分栏布局
   ═══════════════════════════════════════════ */
.home-split-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  align-items: start;
}

.home-left-col { display: flex; flex-direction: column; gap: 24px; }
.home-right-col { display: flex; flex-direction: column; gap: 24px; }

/* ═══ 日记时间线 ═══ */
.diary-timeline { display: flex; flex-direction: column; gap: 0; padding-left: 20px; }

.diary-entry { display: flex; gap: 14px; animation: slide-up 0.5s var(--ease-spring) backwards; }
.de-marker { display: flex; flex-direction: column; align-items: center; width: 16px; flex-shrink: 0; }
.de-dot {
  width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.1);
  box-shadow: 0 0 8px rgba(74,222,128,0.2);
  margin-top: 6px;
}
.de-line { width: 2px; flex: 1; background: rgba(255,255,255,0.04); min-height: 20px; }

.de-card {
  flex: 1; padding: 14px 16px; margin-bottom: 12px;
  border-radius: 14px; cursor: pointer;
}
.de-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.de-mood { font-size: 16px; }
.de-title { font-size: 14px; font-weight: 700; color: var(--text); }
.de-content {
  font-size: 13px; color: var(--text2);
  line-height: 1.6; display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.de-footer { margin-top: 8px; }
.de-date { font-size: 11px; color: var(--text3); }

.diary-more {
  display: flex; align-items: center; justify-content: center;
  padding: 12px; border-radius: 14px;
  text-decoration: none; font-size: 13px; color: var(--text2);
  margin-left: -20px; transition: all 0.2s;
}
.diary-more:hover { color: var(--accent); }

/* ═══ 照片墙 ═══ */
.photo-masonry {
  columns: 3; column-gap: 10px;
}
.photo-item {
  break-inside: avoid;
  margin-bottom: 10px;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  animation: cardAppear 0.5s var(--ease-spring) backwards;
  animation-delay: var(--photo-delay);
}
.photo-img-wrap {
  position: relative; overflow: hidden;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.04);
}
.photo-img-wrap img {
  width: 100%; display: block;
  transition: transform 0.6s ease;
}
.photo-img-wrap:hover img { transform: scale(1.08); }
.photo-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 60%);
  display: flex; flex-direction: column;
  justify-content: flex-end; padding: 14px;
  opacity: 0; transition: opacity 0.3s;
}
.photo-img-wrap:hover .photo-overlay { opacity: 1; }
.po-icon { font-size: 18px; }
.po-title { font-size: 12px; color: white; font-weight: 600; margin-top: 2px; }

.photo-placeholder {
  aspect-ratio: 1;
  border-radius: 14px;
  background: rgba(255,255,255,0.02);
  border: 1px dashed rgba(255,255,255,0.06);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 6px;
}
.pp-icon { font-size: 24px; opacity: 0.3; }
.pp-title { font-size: 12px; color: var(--text3); }

/* ═══════════════════════════════════════════
   响应式
   ═══════════════════════════════════════════ */
@media (max-width: 1024px) {
  .home-split-layout { grid-template-columns: 1fr; }
  .home-left-col { flex-direction: row; flex-wrap: wrap; }
  .home-left-col > * { flex: 1; min-width: 280px; }
}

@media (max-width: 768px) {
  .home-view { padding: 0 0 80px; }
  .hero-galaxy { padding: 24px 20px; border-radius: 20px; }
  .hero-main { flex-direction: column; }
  .hero-title { font-size: 28px; }
  .hero-stats-panel { width: 100%; grid-template-columns: repeat(4, 1fr); }
  .hero-stat-card { width: auto; height: 70px; }
  .hsc-value { font-size: 20px; }
  .photo-masonry { columns: 2; }
}

@media (max-width: 480px) {
  .hero-stats-panel { grid-template-columns: repeat(2, 1fr); }
  .photo-masonry { columns: 1; }
}
</style>
