<template>
  <div class="tools-page">
    <header class="page-header">
      <h1>工具箱</h1>
      <p class="page-subtitle">实用小工具集合</p>
    </header>

    <div class="tool-grid">
      <section class="tool-card">
        <h2 class="card-title">🧮 计算器</h2>
        <Calculator />
      </section>

      <section class="tool-card">
        <h2 class="card-title">⏱ 倒计时</h2>
        <CountdownTool />
      </section>
    </div>
  </div>
</template>

<script setup>
import Calculator from '@/components/Tools/Calculator.vue'
import CountdownTool from '@/components/Tools/Countdown.vue'
</script>

<style scoped>
.tools-page {
  min-height: 100vh;
  padding: 40px 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}
.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 6px;
}
.page-subtitle {
  font-size: 14px;
  color: #888;
}

/* ---- 网格布局 ---- */
.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 28px;
  max-width: 900px;
  margin: 0 auto;
}

/* ---- 工具卡片 ---- */
.tool-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px 20px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.25s;
}
.tool-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.09);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}
</style>
