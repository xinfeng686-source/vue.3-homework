<template>
  <div class="page-pomodoro">
    <header class="page-header">
      <h1>&#127813; 番茄钟</h1>
      <p class="page-subtitle">保持专注，一次只做一件事</p>
    </header>

    <!-- 时间挡位 -->
    <div class="presets">
      <button
        v-for="m in presets"
        :key="m"
        class="preset-btn"
        :class="{ active: selectedMinutes === m }"
        :disabled="pomodoroStore.isRunning"
        @click="selectDuration(m)"
      >{{ m }} 分钟</button>
    </div>

    <PomodoroTimer />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import PomodoroTimer from '@/components/PomodoroTimer.vue'
import { usePomodoroStore } from '@/stores/pomodoroStore'
import { useAppStore } from '@/stores/app'

const pomodoroStore = usePomodoroStore()
const appStore = useAppStore()

// ============================================================
// 多挡位 + 防刷新持久化 + 精确上报
// ------------------------------------------------------------
// 时间追踪改为独立 actualElapsedSeconds 计数器，
// 仅在 setInterval 真实 tick 时 +1，彻底消除
// 「挡位切换产生虚假差值」的 Bug。
// ============================================================

// ---- 时间挡位 ----
const presets = [5, 10, 15, 25]
const selectedMinutes = ref(25)

function selectDuration(minutes) {
  if (pomodoroStore.isRunning) return

  // 切换前先上报当前会话已跑的真实秒数（如果有）
  if (actualElapsedSeconds > 0 && !focusSubmitted) {
    appStore.addFocusTime(actualElapsedSeconds)
  }

  selectedMinutes.value = minutes
  pomodoroStore.setDuration(minutes * 60)
  currentSessionDuration = minutes * 60
  actualElapsedSeconds = 0
  focusSubmitted = false
}

// ---- 当前会话总时长（秒，随挡位变化，用于 complete 上报） ----
let currentSessionDuration = 1500

// ---- 独立计数器：仅当 setInterval 真实递减时 +1 ----
let actualElapsedSeconds = 0

// ---- 持久化 key 前缀 ----
const PREFIX = 'lifeos_pomo_'

// ---- 标志位 ----
let isRestoring = false
let focusSubmitted = false

// ============ 上报时机 ============

// 时机 1：倒计时自然结束 & 累计真实 tick
watch(() => pomodoroStore.timeLeft, (val, oldVal) => {
  if (isRestoring) return

  // 真实 tick 计数：仅当正在运行时递减才算
  if (oldVal !== undefined && val < oldVal && pomodoroStore.isRunning) {
    actualElapsedSeconds++
  }

  // 完整会话完成
  if (oldVal > 0 && val === 0 && pomodoroStore.mode === 'focus' && !focusSubmitted) {
    focusSubmitted = true
    appStore.addFocusTime(currentSessionDuration)
    clearPomoState()
  }
})

// 时机 2：暂停 / 重置 → 上报 actualElapsedSeconds
watch(() => pomodoroStore.isRunning, (running) => {
  if (isRestoring) return
  if (running) {
    focusSubmitted = false
    savePomoRunning()
  } else if (pomodoroStore.mode === 'focus' && !focusSubmitted) {
    if (actualElapsedSeconds > 0) {
      appStore.addFocusTime(actualElapsedSeconds)
      actualElapsedSeconds = 0
      focusSubmitted = true
    }
    savePomoPaused()
  }
})

// 时机 3：组件销毁前
onBeforeUnmount(() => {
  if (isRestoring) return
  if (!focusSubmitted && pomodoroStore.mode === 'focus' && actualElapsedSeconds > 0) {
    appStore.addFocusTime(actualElapsedSeconds)
  }
  savePomoPaused()
})

// ============ 持久化辅助 ============

function savePomoRunning() {
  const endTime = Date.now() + pomodoroStore.timeLeft * 1000
  localStorage.setItem(PREFIX + 'end_time', String(endTime))
  localStorage.setItem(PREFIX + 'duration', String(currentSessionDuration))
  localStorage.setItem(PREFIX + 'running', 'true')
}

function savePomoPaused() {
  localStorage.setItem(PREFIX + 'remaining', String(pomodoroStore.timeLeft * 1000))
  localStorage.setItem(PREFIX + 'duration', String(currentSessionDuration))
  localStorage.setItem(PREFIX + 'running', 'false')
}

function clearPomoState() {
  localStorage.removeItem(PREFIX + 'end_time')
  localStorage.removeItem(PREFIX + 'remaining')
  localStorage.removeItem(PREFIX + 'duration')
  localStorage.removeItem(PREFIX + 'running')
}

// ============ 挂载时恢复 ============

onMounted(() => {
  const running = localStorage.getItem(PREFIX + 'running')

  if (running === 'true') {
    const endTime = parseInt(localStorage.getItem(PREFIX + 'end_time'))
    const savedDuration = parseInt(localStorage.getItem(PREFIX + 'duration')) || 1500
    currentSessionDuration = savedDuration
    selectedMinutes.value = Math.round(savedDuration / 60)
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))

    isRestoring = true
    if (remaining > 0) {
      pomodoroStore.restoreTimer(remaining)
      pomodoroStore.startTimer()
    } else {
      // 已经过期 → 上报完整会话时长
      appStore.addFocusTime(currentSessionDuration)
      focusSubmitted = true
      pomodoroStore.resetTimer()
    }
    isRestoring = false
    clearPomoState()

  } else if (running === 'false') {
    const remainingMs = parseInt(localStorage.getItem(PREFIX + 'remaining'))
    const savedDuration = parseInt(localStorage.getItem(PREFIX + 'duration')) || 1500
    if (remainingMs && remainingMs > 0) {
      currentSessionDuration = savedDuration
      selectedMinutes.value = Math.round(savedDuration / 60)
      pomodoroStore.setDuration(Math.floor(remainingMs / 1000))
    }
    clearPomoState()
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

/* ---- 时间挡位 ---- */
.presets {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.preset-btn {
  padding: 8px 18px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #555;
  user-select: none;
}
.preset-btn:hover {
  border-color: #e74c3c;
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.06);
}
.preset-btn.active {
  background: #e74c3c;
  color: #fff;
  border-color: #e74c3c;
}
.preset-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
