import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useAppStore = defineStore('app', () => {
  const loading = ref(false)
  const theme = ref('light')
  const globalTitle = ref('LifeOS 个人数字生活舱')

  // ======== 跨模块统计（供 Dashboard / Records / Pomodoro 联动） ========
  const pendingTasksCount = ref(parseInt(localStorage.getItem('lifeos_pending_tasks')) || 0)
  const totalRecordsCount = ref(parseInt(localStorage.getItem('lifeos_total_records')) || 0)

  // ---- 专注时长（底层以秒记录，对外暴露分钟） ----
  const todayFocusSeconds = ref(parseInt(localStorage.getItem('lifeos_focus_seconds')) || 0)
  const todayFocusMinutes = computed(() =>
    parseFloat((todayFocusSeconds.value / 60).toFixed(1))
  )

  // ---- 衍生计算 ----
  const completedTasksCount = computed(
    () => totalRecordsCount.value - pendingTasksCount.value
  )

  // ---- 任务看板上报 ----
  function updateTaskStats(pending, total) {
    pendingTasksCount.value = pending
    totalRecordsCount.value = total
  }

  // ---- 番茄钟上报 ----
  function addFocusTime(seconds) {
    todayFocusSeconds.value += seconds
  }

  // ---- 持久化：状态变化时自动写入 localStorage ----
  watch(
    [pendingTasksCount, totalRecordsCount, todayFocusSeconds],
    ([p, t, s]) => {
      localStorage.setItem('lifeos_pending_tasks', String(p))
      localStorage.setItem('lifeos_total_records', String(t))
      localStorage.setItem('lifeos_focus_seconds', String(s))
    }
  )

  return {
    loading,
    theme,
    globalTitle,
    // 统计
    pendingTasksCount,
    todayFocusSeconds,
    todayFocusMinutes,
    totalRecordsCount,
    completedTasksCount,
    // 动作
    updateTaskStats,
    addFocusTime,
  }
})
