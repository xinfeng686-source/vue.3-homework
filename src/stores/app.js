import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const loading = ref(false)
  const theme = ref('light')
  const globalTitle = ref('LifeOS 个人数字生活舱')

  // ======== 跨模块统计（供 Dashboard / Records / Pomodoro 联动） ========
  const pendingTasksCount = ref(0)   // 待办任务数
  const todayFocusTime = ref(0)      // 今日专注时长（分钟）
  const totalRecordsCount = ref(0)   // 记录总数

  // ---- 任务看板上报 ----
  function updateTaskStats(pending, total) {
    pendingTasksCount.value = pending
    totalRecordsCount.value = total
  }

  // ---- 番茄钟上报 ----
  function addFocusTime(minutes) {
    todayFocusTime.value += minutes
  }

  return {
    loading,
    theme,
    globalTitle,
    // 统计
    pendingTasksCount,
    todayFocusTime,
    totalRecordsCount,
    // 动作
    updateTaskStats,
    addFocusTime,
  }
})
