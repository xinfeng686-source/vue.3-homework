<template>
  <div class="dashboard">
    <!-- 顶部标题栏 -->
    <header class="dashboard-header">
      <h1 class="dashboard-title">效率工具</h1>
      <p class="dashboard-subtitle">轻量效率工具 Dashboard</p>
    </header>

    <!-- 功能入口导航面板 -->
    <nav class="nav-grid">
      <router-link
        v-for="card in cards"
        :key="card.to"
        :to="card.to"
        class="nav-card"
      >
        <span class="nav-card-icon">{{ card.icon }}</span>
        <span class="nav-card-title">{{ card.title }}</span>
        <span class="nav-card-desc">{{ card.desc }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
const cards = [
  { to: '/pomodoro', icon: '🍅', title: '番茄钟', desc: '专注计时工具' },
  { to: '/tools',    icon: '🔧', title: '工具箱', desc: '实用小工具集合' },
  { to: '/countdown', icon: '⏱', title: '倒计时', desc: '倒计时与提醒' },
  { to: '/quotes',   icon: '💬', title: '每日名言', desc: '精选格言' },
  { to: '/records',  icon: '📊', title: '记录', desc: '使用数据记录' },
]
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

/* ---- 标题 ---- */
.dashboard-header {
  text-align: center;
  margin-bottom: 48px;
}

.dashboard-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}

.dashboard-subtitle {
  font-size: 15px;
  color: #888;
}

/* ---- 导航卡片网格 ---- */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 680px;
  width: 100%;
}

@media (max-width: 600px) {
  .nav-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
}

@media (max-width: 380px) {
  .nav-grid {
    grid-template-columns: 1fr;
  }
}

/* ---- 卡片 ---- */
.nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 16px 22px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-decoration: none;
  color: #2c3e50;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.nav-card:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.10);
}

.nav-card-icon {
  font-size: 36px;
  line-height: 1;
}

.nav-card-title {
  font-size: 16px;
  font-weight: 600;
}

.nav-card-desc {
  font-size: 12px;
  color: #999;
}
</style>
