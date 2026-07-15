<template>
  <div class="placeholder-view">
    <h1 class="page-title">{{ title }}</h1>
    <div class="placeholder-card">
      <div class="placeholder-icon">{{ icon }}</div>
      <p class="placeholder-text">{{ description }}</p>
      <p class="placeholder-hint">🚧 页面重构中，即将上线...</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  icon: String,
  description: String
})
</script>

<style scoped>
.page-title {
  font-size: 28px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #4ade80, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.placeholder-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  padding: 48px;
  text-align: center;
}
.placeholder-icon {
  font-size: 64px;
  margin-bottom: 16px;
}
.placeholder-text {
  font-size: 16px;
  color: #94a3b8;
  margin-bottom: 12px;
}
.placeholder-hint {
  font-size: 14px;
  color: #64748b;
}
</style>
