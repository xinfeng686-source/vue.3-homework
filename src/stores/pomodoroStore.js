import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePomodoroStore = defineStore('pomodoro', () => {
  // ============ 常量 ============
  const FOCUS_TIME = 1500   // 25 min
  const BREAK_TIME = 300    // 5 min

  // ============ 状态 ============
  const timeLeft = ref(FOCUS_TIME)
  const isRunning = ref(false)
  const mode = ref('focus') // 'focus' | 'break'

  // timer id（模块级闭包，不暴露到外部）
  let timerId = null

  // ============ 衍生状态 ============
  const formattedTime = computed(() => {
    const m = Math.floor(timeLeft.value / 60)
    const s = timeLeft.value % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  const modeLabel = computed(() =>
    mode.value === 'focus' ? '专注' : '休息'
  )

  // ============ 方法 ============
  function startTimer() {
    if (isRunning.value) return // 防止重复开启
    isRunning.value = true
    timerId = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
      }
      if (timeLeft.value <= 0) {
        clearInterval(timerId)
        timerId = null
        isRunning.value = false
      }
    }, 1000)
  }

  function pauseTimer() {
    if (!isRunning.value) return
    clearInterval(timerId)
    timerId = null
    isRunning.value = false
  }

  function resetTimer() {
    pauseTimer()
    timeLeft.value = mode.value === 'focus' ? FOCUS_TIME : BREAK_TIME
  }

  // 供 Pomodoro.vue 调用：切换时间挡位
  function setDuration(seconds) {
    if (isRunning.value) return
    timeLeft.value = seconds
    mode.value = 'focus'
  }

  // 供 Pomodoro.vue 调用：从 localStorage 恢复倒计时
  function restoreTimer(remainingSeconds) {
    timeLeft.value = remainingSeconds
    isRunning.value = false
  }

  function switchMode() {
    pauseTimer()
    mode.value = mode.value === 'focus' ? 'break' : 'focus'
    timeLeft.value = mode.value === 'focus' ? FOCUS_TIME : BREAK_TIME
  }

  return {
    // 状态
    timeLeft,
    isRunning,
    mode,
    // 衍生
    formattedTime,
    modeLabel,
    // 方法
    startTimer,
    pauseTimer,
    resetTimer,
    setDuration,
    restoreTimer,
    switchMode
  }
})
