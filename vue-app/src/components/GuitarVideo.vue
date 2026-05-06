<template>
  <section class="guitar-video-section">
    <div class="section-header">
      <h2>🎸 吉他演奏</h2>
      <button class="btn-text" @click="$router.push('/guitar')">查看全部 →</button>
    </div>
    <div class="video-container">
      <video
        v-if="video"
        :src="video.url"
        controls
        muted
        class="video-player"
      ></video>
      <div v-else class="empty-video">
        <span class="empty-icon">🎸</span>
        <p>还没有上传演奏视频</p>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  video: { type: Object, default: null }
})
</script>

<style scoped>
.guitar-video-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.btn-text {
  background: none;
  border: none;
  color: var(--accent);
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-text:hover {
  background: var(--accent-dim);
}

.video-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  width: 100%;
}

.video-player {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  display: block;
  background: var(--surface2);
}

.empty-video {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: var(--surface2);
  border-radius: 12px;
  aspect-ratio: 16/9;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.4;
}

.empty-video p {
  color: var(--text3);
  font-size: 13px;
  margin: 0;
}
</style>