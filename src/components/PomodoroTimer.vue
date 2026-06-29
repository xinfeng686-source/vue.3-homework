<template>
  <div class="pomodoro-timer">
    <div class="mode-badge" :class="store.mode">
      {{ store.modeLabel }}
    </div>

    <div class="timer-ring" :class="store.mode">
      <div class="timer-face">
        <span class="time-display">{{ store.formattedTime }}</span>
      </div>
    </div>

    <div class="controls">
      <button
        class="btn btn-start"
        :disabled="store.isRunning"
        @click="store.startTimer()"
      >
        开始
      </button>
      <button
        class="btn btn-pause"
        :disabled="!store.isRunning"
        @click="store.pauseTimer()"
      >
        暂停
      </button>
      <button class="btn btn-reset" @click="store.resetTimer()">
        重置
      </button>
    </div>

    <div class="mode-switch">
      <button
        class="btn btn-mode"
        :class="{ active: store.mode === 'focus' }"
        @click="store.switchMode()"
      >
        专注
      </button>
      <button
        class="btn btn-mode"
        :class="{ active: store.mode === 'break' }"
        @click="store.switchMode()"
      >
        休息
      </button>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { usePomodoroStore } from '@/stores/pomodoroStore'
import { useRecordsStore } from '@/stores/recordsStore'

const store = usePomodoroStore()
const recordsStore = useRecordsStore()

// 当专注倒计时归零（自然结束），自动记录一条番茄钟完成记录
watch(
  () => store.timeLeft,
  (val, oldVal) => {
    if (store.mode === 'focus' && oldVal === 1 && val === 0) {
      recordsStore.addRecord('focus', 25)
    }
    if (store.mode === 'break' && oldVal === 1 && val === 0) {
      recordsStore.addRecord('break', 5)
    }
  }
)
</script>

<style scoped>
.pomodoro-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 48px 24px;
}

.mode-badge {
  font-size: 16px;
  font-weight: 600;
  padding: 6px 20px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  transition: background 0.3s, color 0.3s;
}
.mode-badge.focus {
  background: #fde8e8;
  color: #c0392b;
}
.mode-badge.break {
  background: #e8f8e8;
  color: #27ae60;
}

.timer-ring {
  width: 240px;
  height: 240px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s, box-shadow 0.3s;
}
.timer-ring.focus {
  border: 6px solid #e74c3c;
  box-shadow: 0 0 24px rgba(231, 76, 60, 0.15);
}
.timer-ring.break {
  border: 6px solid #2ecc71;
  box-shadow: 0 0 24px rgba(46, 204, 113, 0.15);
}

.timer-face {
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-display {
  font-size: 54px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 4px;
  color: #2c3e50;
}

.controls {
  display: flex;
  gap: 16px;
}

.btn {
  min-width: 88px;
  padding: 10px 24px;
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
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-start {
  background: #e74c3c;
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

.mode-switch {
  display: flex;
  gap: 12px;
}
.btn-mode {
  background: #ecf0f1;
  color: #2c3e50;
  min-width: 72px;
}
.btn-mode.active {
  background: #2c3e50;
  color: #fff;
}
</style>
