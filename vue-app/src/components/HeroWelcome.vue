<template>
  <section class="hero-section">
    <div class="hero-content">
      <h1 class="greeting">{{ greeting }}，永远的神！</h1>
      <p class="today-date">{{ todayDate }}</p>
      <div class="daily-quote" v-if="dailyQuote">
        <span class="quote-mark">"</span>
        <span class="quote-text">{{ dailyQuote.text }}</span>
        <span class="quote-author">—— {{ dailyQuote.author }}</span>
      </div>
    </div>
    <div class="hero-stats">
      <div class="hero-stat">
        <span class="hero-stat-value">{{ stats.diary }}</span>
        <span class="hero-stat-label">日记</span>
      </div>
      <div class="hero-stat">
        <span class="hero-stat-value">{{ stats.shines }}</span>
        <span class="hero-stat-label">闪光</span>
      </div>
      <div class="hero-stat">
        <span class="hero-stat-value">{{ stats.guitar }}</span>
        <span class="hero-stat-label">吉他</span>
      </div>
      <div class="hero-stat">
        <span class="hero-stat-value">{{ unlockedBadges }}</span>
        <span class="hero-stat-label">徽章</span>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  greeting: String,
  todayDate: String,
  dailyQuote: Object,
  stats: { type: Object, default: () => ({ diary: 0, shines: 0, guitar: 0 }) },
  unlockedBadges: { type: Number, default: 0 }
})
</script>

<style scoped>
.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0;
  padding: 28px 32px;
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(129, 140, 248, 0.06) 100%);
  border-radius: 20px;
  border: 1px solid rgba(74, 222, 128, 0.2);
  transition: all 0.3s ease;
}

.hero-section:hover {
  border-color: rgba(74, 222, 128, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.hero-content {
  flex: 1;
}

.greeting {
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 6px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.today-date {
  font-size: 15px;
  color: var(--text2);
  margin-bottom: 14px;
  font-weight: 500;
}

.daily-quote {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.quote-mark {
  font-size: 28px;
  color: var(--accent);
  opacity: 0.6;
  line-height: 1;
  font-weight: 700;
}

.quote-text {
  color: var(--text);
  font-size: 16px;
  font-style: italic;
  line-height: 1.6;
}

.quote-author {
  color: var(--text2);
  font-size: 13px;
  font-weight: 500;
}

.hero-stats {
  display: flex;
  gap: 32px;
  padding-left: 32px;
  border-left: 1px solid rgba(255,255,255,0.1);
}

.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.hero-stat-value {
  font-size: 36px;
  font-weight: 900;
  color: var(--accent);
  text-shadow: 0 0 20px rgba(74, 222, 128, 0.4);
  line-height: 1;
}

.hero-stat-label {
  font-size: 13px;
  color: var(--text2);
  font-weight: 600;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    gap: 20px;
  }
  .hero-stats {
    padding-left: 0;
    border-left: none;
    border-top: 1px solid var(--border);
    padding-top: 20px;
    width: 100%;
    justify-content: space-around;
  }
  .greeting {
    font-size: 22px;
  }
}
</style>