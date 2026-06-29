<template>
  <div class="page-placeholder">
    <h1>倒计时</h1>
    <p class="desc">Countdown — 倒计时与提醒</p>
    <router-link to="/" class="back-link">&larr; 返回首页</router-link>
  </div>
</template>

<script setup>
// Countdown 占位页
</script>

<style scoped>
.page-placeholder {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #333;
}
.page-placeholder h1 { font-size: 2rem; margin-bottom: 0.5rem; }
.desc { color: #888; margin-bottom: 1.5rem; }
.back-link { color: #3498db; text-decoration: none; font-size: 14px; }
.back-link:hover { text-decoration: underline; }
</style>
