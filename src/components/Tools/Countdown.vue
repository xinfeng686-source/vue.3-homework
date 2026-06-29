<template>
  <div class="countdown-tool">
    <!-- 输入区 -->
    <div class="input-group">
      <label class="input-field">
        <span>分钟</span>
        <input
          v-model.number="minutes"
          type="number"
          min="0"
          max="999"
          :disabled="isRunning"
        />
      </label>
      <label class="input-field">
        <span>秒</span>
        <input
          v-model.number="seconds"
          type="number"
          min="0"
          max="59"
          :disabled="isRunning"
        />
      </label>
    </div>

    <!-- 倒计时显示 -->
    <div class="timer-face" :class="{ finished: isFinished }">
      <span class="time-text">{{ displayTime }}</span>
      <span v-if="isFinished" class="time-up-label">时间到！</span>
    </div>

    <!-- 控制按钮 -->
    <div class="actions">
      <button
        class="btn btn-go"
        :disabled="isRunning || timeLeft <= 0"
        @click="startTimer"
      >
        开始
      </button>
      <button
        class="btn btn-pause"
        :disabled="!isRunning"
        @click="pauseTimer"
      >
        暂停
      </button>
      <button class="btn btn-reset" @click="resetTimer">
        重置
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

// ============================================================
// 倒计时核心逻辑
// ------------------------------------------------------------
// 计时器用 setInterval 实现，timerId 存在闭包变量中（不被 Vue
// 响应式追踪，避免不必要的渲染）。
//
// 生命周期安全：
// ┌──────────────────────────────────────────────────────┐
// │ onUnmounted() → clearInterval(timerId)              │
// │ 这是防止内存泄漏的最终防线。不管用户是切换路由还是     │
// │ 组件被 v-if 销毁，hook 都会清理定时器。              │
// └──────────────────────────────────────────────────────┘
//
// 每次 start 前先 clearInterval 旧的 timerId，确保不会
// 出现多个定时器同时递减的 bug。
// ============================================================

const DEFAULT_MINUTES = 5
const DEFAULT_SECONDS = 0

const minutes = ref(DEFAULT_MINUTES)
const seconds = ref(DEFAULT_SECONDS)
const timeLeft = ref(DEFAULT_MINUTES * 60 + DEFAULT_SECONDS)

const isRunning = ref(false)
const isFinished = ref(false)

// timerId 存在闭包中，不暴露到模板
let timerId = null

// ---- 当分钟/秒输入变化时，同步更新 timeLeft（仅停止时生效）----
watch([minutes, seconds], () => {
  if (!isRunning.value) {
    timeLeft.value = minutes.value * 60 + seconds.value
    isFinished.value = false
  }
})

// ---- 格式化显示 MM:SS ----
const displayTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
  const s = timeLeft.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

// ---- 开始 ----
function startTimer() {
  if (isRunning.value) return
  if (timeLeft.value <= 0) return

  // 安全：先清除可能残留的旧定时器
  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }

  isRunning.value = true
  isFinished.value = false

  timerId = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    }
    if (timeLeft.value <= 0) {
      clearInterval(timerId)
      timerId = null
      isRunning.value = false
      isFinished.value = true
    }
  }, 1000)
}

// ---- 暂停 ----
function pauseTimer() {
  if (!isRunning.value) return
  clearInterval(timerId)
  timerId = null
  isRunning.value = false
}

// ---- 重置 ----
function resetTimer() {
  pauseTimer()
  timeLeft.value = minutes.value * 60 + seconds.value
  isFinished.value = false
}

// ---- 组件销毁时强制清理定时器 ----
onUnmounted(() => {
  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }
})
</script>

<style scoped>
.countdown-tool {
  max-width: 340px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* ---- 输入区 ---- */
.input-group {
  display: flex;
  gap: 12px;
  width: 100%;
}
.input-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #666;
}
.input-field input {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  text-align: center;
  outline: none;
  transition: border-color 0.2s;
}
.input-field input:focus {
  border-color: #3498db;
}
.input-field input:disabled {
  background: #f0f0f0;
  cursor: not-allowed;
}

/* ---- 倒计时显示 ---- */
.timer-face {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px;
  background: #1e2a3a;
  border-radius: 16px;
  width: 100%;
  transition: background 0.4s;
}
.timer-face.finished {
  background: #e74c3c;
  animation: pulse 0.6s ease-in-out 3;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}

.time-text {
  font-size: 56px;
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  letter-spacing: 4px;
  color: #fff;
  line-height: 1;
}
.timer-face.finished .time-text {
  color: #ffe0e0;
}

.time-up-label {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
}

/* ---- 按钮 ---- */
.actions {
  display: flex;
  gap: 10px;
  width: 100%;
}
.btn {
  flex: 1;
  padding: 10px 0;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}
.btn:active {
  transform: scale(0.96);
}
.btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-go {
  background: #27ae60;
  color: #fff;
}
.btn-pause {
  background: #f39c12;
  color: #fff;
}
.btn-reset {
  background: #bdc3c7;
  color: #2c3e50;
}
</style>
