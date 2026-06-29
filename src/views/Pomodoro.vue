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

import { watch } from 'vue'
import { onBeforeUnmount } from 'vue'
import PomodoroTimer from '@/components/PomodoroTimer.vue'
import { usePomodoroStore } from '@/stores/pomodoroStore'
import { useAppStore } from '@/stores/app'

const pomodoroStore = usePomodoroStore()
const appStore = useAppStore()

const FOCUS_SECONDS = 1500
let focusSubmitted = false

// 时机 1：倒计时自然结束 → 上报完整 25 分钟（单位：秒）
watch(() => pomodoroStore.timeLeft, (val, oldVal) => {
  if (oldVal > 0 && val === 0 && pomodoroStore.mode === 'focus' && !focusSubmitted) {
    focusSubmitted = true
    appStore.addFocusTime(FOCUS_SECONDS)
  }
})

// 时机 2：暂停 / 重置 → 上报已消耗的秒数
watch(() => pomodoroStore.isRunning, (running) => {
  if (running) {
    focusSubmitted = false
  } else if (pomodoroStore.mode === 'focus' && !focusSubmitted) {
    const elapsed = FOCUS_SECONDS - pomodoroStore.timeLeft
    if (elapsed > 0) {
      appStore.addFocusTime(elapsed)
      focusSubmitted = true
    }
  }
})

// 时机 3：组件销毁前（路由跳走）→ 上报剩余秒数
onBeforeUnmount(() => {
  if (!focusSubmitted && pomodoroStore.mode === 'focus') {
    const elapsed = FOCUS_SECONDS - pomodoroStore.timeLeft
    if (elapsed > 0) {
      appStore.addFocusTime(elapsed)
    }
  }
})

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
