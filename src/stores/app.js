import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // ---- 全局状态占位 ----
  const loading = ref(false)
  const theme = ref('light')
  const globalTitle = ref('效率工具 Dashboard')

  // ---- 仅作全局状态占位，不放业务逻辑 ----

  return {
    loading,
    theme,
    globalTitle
  }
})
