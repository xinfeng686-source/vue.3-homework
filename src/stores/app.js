import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const loading = ref(false)
  const theme = ref('light')
  const globalTitle = ref('LifeOS 个人数字生活舱')

  // ======== 跨模块统计（供 Dashboard / Records / Pomodoro 联动） ========
  const pendingTasksCount = ref(0)   // 待办任务数
    const totalRecordsCount = ref(0)   // 记录总数

  // ---- 专注时长（底层以秒记录，对外暴露分钟） ----
  const todayFocusSeconds = ref(0)
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
