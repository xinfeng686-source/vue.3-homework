<template>
  <div class="dashboard">
    <div class="container">

      <!-- ====== 顶部问候区 ====== -->
      <header class="greeting">
        <p class="date">{{ dateStr }}</p>
        <h1 class="greeting-text">{{ greeting.emoji }} {{ greeting.text }}</h1>
      </header>

      <!-- ====== 每日格言 ====== -->
      <section class="quote-card">
        <div v-if="loading" class="quote-loading">正在获取生活灵感…</div>
        <template v-else>
          <blockquote class="quote-text">“{{ quote }}”</blockquote>
          <cite class="quote-author">—— {{ author }}</cite>
          <button class="refresh-btn" @click="fetchQuote" title="换一句">&orarr;</button>
        </template>
      </section>

      <!-- ====== 快捷导航 ====== -->
      <nav class="nav-row">
        <router-link to="/pomodoro" class="nav-card">
          <span class="nav-icon">🍅</span>
          <span class="nav-label">专注空间</span>
          <span class="nav-desc">Focus</span>
        </router-link>
        <router-link to="/tools" class="nav-card">
          <span class="nav-icon">🧩</span>
          <span class="nav-label">生活小部件</span>
          <span class="nav-desc">Widgets</span>
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
      // 请求失败 → 使用本地保底名言
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
  background: #fff;
  border-radius: 20px;
  padding: 36px 28px 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 32px;
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
  quotes: none;
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

/* ---- 快捷导航 ---- */
.nav-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 28px 14px 22px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  text-decoration: none;
  color: #2c3e50;
  transition: transform 0.2s, box-shadow 0.2s;
}
.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
}

.nav-icon {
  font-size: 34px;
  line-height: 1;
}

.nav-label {
  font-size: 16px;
  font-weight: 600;
}

.nav-desc {
  font-size: 12px;
  color: #999;
}
</style>
