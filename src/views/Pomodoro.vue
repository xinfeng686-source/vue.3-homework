<template>
  <div class="page-pomodoro">
    <header class="page-header">
      <h1>番茄钟</h1>
      <p class="page-subtitle">保持专注，一次只做一件事</p>
    </header>
    <PomodoroTimer />
  </div>
</template>

<script setup>
import PomodoroTimer from '@/components/PomodoroTimer.vue'
</script>

<style scoped>
.page-pomodoro {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #2c3e50;
}

.page-header {
  text-align: center;
  margin-bottom: 8px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 6px;
}

.page-subtitle {
  font-size: 14px;
  color: #888;
}
</style>
