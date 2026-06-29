import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'efficiency-dashboard:records'

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export const useRecordsStore = defineStore('records', () => {
  const records = ref(loadRecords())

  const totalFocusMinutes = computed(() => {
    return records.value
      .filter(r => r.type === 'focus')
      .reduce((sum, r) => sum + r.duration, 0)
  })

  const totalSessions = computed(() => records.value.length)

  const todayTotalMinutes = computed(() => {
    const today = new Date().toDateString()
    return records.value
      .filter(r => r.type === 'focus' && new Date(r.completedAt).toDateString() === today)
      .reduce((sum, r) => sum + r.duration, 0)
  })

  const todaySessions = computed(() => {
    const today = new Date().toDateString()
    return records.value.filter(r => new Date(r.completedAt).toDateString() === today).length
  })

  const recentRecords = computed(() => {
    return [...records.value].reverse().slice(0, 50)
  })

  const streakDays = computed(() => {
    if (!records.value.length) return 0
    const days = new Set(
      records.value.map(r => new Date(r.completedAt).toDateString())
    )
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      if (days.has(d.toDateString())) {
        streak++
      } else {
        break
      }
    }
    return streak
  })

  function addRecord(type, duration, note = '') {
    records.value.push({
      type,
      duration,
      note,
      completedAt: new Date().toISOString()
    })
    saveRecords(records.value)
  }

  return { records, totalFocusMinutes, totalSessions, todayTotalMinutes, todaySessions, recentRecords, streakDays, addRecord }
})
