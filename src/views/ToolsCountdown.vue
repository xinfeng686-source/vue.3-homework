<template>
  <div class="tool-page">
    <router-link to="/tools" class="back-link">← 返回工具箱</router-link>
    <h2 class="tool-title">⏱ 倒计时</h2>
    <CountdownTool />
  </div>
</template>

<script setup>
import CountdownTool from '@/components/Tools/Countdown.vue'
</script>

<style scoped>
.tool-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px 60px;
}
.back-link {
  align-self: flex-start;
  color: #3498db;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 8px;
}
.back-link:hover {
  text-decoration: underline;
}
.tool-title {
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 28px;
}
</style>
