<template>
  <div class="dashboard">
    <div class="container">

      <!-- ====== 顶部问候区 ====== -->
      <header class="greeting">
        <p class="date">{{ dateStr }}</p>
        <h1 class="greeting-text">{{ greeting.emoji }} {{ greeting.text }}</h1>
      </header>

      <!-- ====== 每日格言 ====== -->
      <section class="quote-card glass">
        <div v-if="loading" class="quote-loading">正在获取生活灵感…</div>
        <template v-else>
          <blockquote class="quote-text">"{{ quote }}"</blockquote>
          <cite class="quote-author">—— {{ author }}</cite>
          <button class="refresh-btn" @click="fetchQuote" title="换一句">&orarr;</button>
        </template>
      </section>

      <!-- ====== 数据概览 ====== -->
      <section class="stats-row">
        <div class="stat-card glass">
          <span class="stat-value">3</span>
          <span class="stat-unit">项</span>
          <span class="stat-label">待办任务</span>
        </div>
        <div class="stat-card glass">
          <span class="stat-value">45</span>
          <span class="stat-unit">min</span>
          <span class="stat-label">今日专注</span>
        </div>
        <div class="stat-card glass">
          <span class="stat-value">12</span>
          <span class="stat-unit">条</span>
          <span class="stat-label">记录总数</span>
        </div>
      </section>

      <!-- ====== 快捷导航 ====== -->
      <nav class="nav-row">
        <router-link to="/pomodoro" class="nav-card glass">
          <span class="nav-icon">🍅</span>
          <span class="nav-label">专注空间</span>
          <span class="nav-desc">Focus</span>
        </router-link>
        <router-link to="/tools" class="nav-card glass">
          <span class="nav-icon">🧩</span>
          <span class="nav-label">生活小部件</span>
          <span class="nav-desc">Widgets</span>
        </router-link>
        <router-link to="/records" class="nav-card glass">
          <span class="nav-icon">📋</span>
          <span class="nav-label">任务看板</span>
          <span class="nav-desc">Records</span>
        </router-link>
      </nav>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// ---- 动态问候 ----
const days = ['日', '一', '二', '三', '四', '五', '六']
const d = new Date()
const dateStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${days[d.getDay()]}`

function getGreeting() {
  const h = d.getHours()
  if (h < 6)  return { text: '夜深了，注意休息', emoji: '🌙' }
  if (h < 9)  return { text: '早上好',           emoji: '🌅' }
  if (h < 12) return { text: '上午好',           emoji: '☀️' }
  if (h < 14) return { text: '中午好',           emoji: '⛅' }
  if (h < 18) return { text: '下午好',           emoji: '☀️' }
  return { text: '晚上好', emoji: '🌆' }
}
const greeting = getGreeting()

// ---- 每日格言 ----
const quote = ref('')
const author = ref('')
const loading = ref(true)
const error = ref(false)

const FALLBACK_QUOTE = '生活就像一盒巧克力，你永远不知道下一颗是什么味道。'
const FALLBACK_AUTHOR = '《阿甘正传》'

function fetchQuote() {
  loading.value = true
  error.value = false

  axios.get('https://v1.hitokoto.cn/')
    .then((res) => {
      quote.value = res.data.hitokoto
      author.value = res.data.from || '匿名'
    })
    .catch(() => {
      error.value = true
      quote.value = FALLBACK_QUOTE
      author.value = FALLBACK_AUTHOR
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  fetchQuote()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 40px 24px;
  background: linear-gradient(145deg, #fef9f4 0%, #f8f0e6 50%, #f0f4f8 100%);
}

.container {
  width: 100%;
  max-width: 480px;
}

/* ---- 毛玻璃通用类 ---- */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

/* ---- 问候区 ---- */
.greeting {
  text-align: center;
  margin-bottom: 40px;
  margin-top: 40px;
}

.date {
  font-size: 14px;
  color: #a08070;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.greeting-text {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
}

/* ---- 格言卡片 ---- */
.quote-card {
  position: relative;
  border-radius: 20px;
  padding: 36px 28px 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  text-align: center;
  transition: box-shadow 0.25s;
}
.quote-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.09);
}

.quote-loading {
  font-size: 15px;
  color: #aaa;
  padding: 20px 0;
}

.quote-text {
  font-size: 18px;
  line-height: 1.7;
  color: #3a2a1a;
  font-style: normal;
  margin-bottom: 14px;
}

.quote-author {
  display: block;
  font-size: 13px;
  color: #b09080;
  font-style: normal;
}

.refresh-btn {
  position: absolute;
  bottom: 12px;
  right: 16px;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.2s, transform 0.15s;
  line-height: 1;
}
.refresh-btn:hover {
  opacity: 0.7;
  transform: rotate(180deg);
}

/* ---- 数据概览 ---- */
.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 16px 8px 14px;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s;
}
.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.1;
}

.stat-unit {
  font-size: 11px;
  color: #aaa;
  margin-top: -2px;
}

.stat-label {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

/* ---- 快捷导航 ---- */
.nav-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px 10px 20px;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  text-decoration: none;
  color: #2c3e50;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
}
.nav-card:active {
  transform: scale(0.96);
}

.nav-icon {
  font-size: 30px;
  line-height: 1;
}

.nav-label {
  font-size: 14px;
  font-weight: 600;
}

.nav-desc {
  font-size: 11px;
  color: #999;
}
</style>
