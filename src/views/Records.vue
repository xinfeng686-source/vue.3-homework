<template>
  <div class="records-page">
    <header class="page-header">
      <router-link to="/" class="back-link">&larr; 返回首页</router-link>
      <h1>记录与统计</h1>
    </header>

    <!-- 概览卡片 -->
    <section class="stats-grid">
      <div class="stat-card">
        <span class="stat-icon">&#9200;</span>
        <span class="stat-value">{{ store.totalFocusMinutes }}</span>
        <span class="stat-label">总专注分钟</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">&#128221;</span>
        <span class="stat-value">{{ store.totalSessions }}</span>
        <span class="stat-label">总完成次数</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">&#128200;</span>
        <span class="stat-value">{{ store.streakDays }}</span>
        <span class="stat-label">连续天数</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">&#127773;</span>
        <span class="stat-value">{{ store.todaySessions }}</span>
        <span class="stat-label">今日完成</span>
      </div>
    </section>

    <!-- 近7天柱状图 -->
    <section class="chart-section">
      <h2 class="section-title">近 7 天专注时长</h2>
      <div class="bar-chart" v-if="weeklyData.length">
        <div
          class="bar-wrapper"
          v-for="item in weeklyData"
          :key="item.label"
        >
          <div class="bar-label">{{ item.label }}</div>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{ height: item.percent + '%' }"
              :title="item.minutes + ' 分钟'"
            ></div>
          </div>
          <div class="bar-value">{{ item.minutes }}m</div>
        </div>
      </div>
      <p v-else class="empty-hint">暂无数据，完成一次番茄钟后再来看看吧</p>
    </section>

    <!-- 最近记录列表 -->
    <section class="history-section">
      <h2 class="section-title">最近记录</h2>
      <div v-if="store.recentRecords.length" class="record-list">
        <div
          v-for="(r, idx) in store.recentRecords"
          :key="idx"
          class="record-item"
          :class="r.type"
        >
          <span class="record-icon">{{ r.type === 'focus' ? '&#127822;' : '&#127808;' }}</span>
          <span class="record-type">{{ r.type === 'focus' ? '专注' : '休息' }}</span>
          <span class="record-duration">{{ r.duration }} 分钟</span>
          <span class="record-time">{{ formatTime(r.completedAt) }}</span>
        </div>
      </div>
      <p v-else class="empty-hint">暂无记录</p>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRecordsStore } from '@/stores/recordsStore'

const store = useRecordsStore()

const weeklyData = computed(() => {
  const result = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dayStr = d.toDateString()
    const total = store.records
      .filter(r => r.type === 'focus' && new Date(r.completedAt).toDateString() === dayStr)
      .reduce((sum, r) => sum + r.duration, 0)
    const maxMin = 50
    result.push({
      label: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
      minutes: total,
      percent: Math.min((total / maxMin) * 100, 100)
    })
  }
  return result
})

function formatTime(iso) {
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return d.getMonth() + 1 + "/" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes())
}
</script>

<style scoped>
.records-page {
  min-height: 100vh;
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 20px 80px;
  background: #f5f7fa;
  color: #2c3e50;
}

.page-header {
  margin-bottom: 28px;
}
.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  margin-top: 8px;
}
.back-link {
  color: #3498db;
  text-decoration: none;
  font-size: 14px;
}
.back-link:hover {
  text-decoration: underline;
}

/* ---- 概览卡片 ---- */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px 12px 16px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}
.stat-icon {
  font-size: 28px;
  line-height: 1;
}
.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #2c3e50;
}
.stat-label {
  font-size: 12px;
  color: #999;
}

/* ---- 图表 ---- */
.chart-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #2c3e50;
}

.bar-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 8px;
  background: #fff;
  border-radius: 14px;
  padding: 20px 12px 12px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}

.bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.bar-label {
  font-size: 11px;
  color: #999;
  order: 2;
}

.bar-track {
  width: 100%;
  max-width: 36px;
  height: 120px;
  background: #ecf0f1;
  border-radius: 6px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  order: 1;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #e74c3c, #c0392b);
  border-radius: 6px;
  transition: height 0.4s ease;
  min-height: 2px;
}

.bar-value {
  font-size: 10px;
  color: #888;
  font-weight: 600;
  order: 0;
}

/* ---- 记录列表 ---- */
.history-section {
  margin-bottom: 32px;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  font-size: 14px;
}

.record-icon {
  font-size: 20px;
  line-height: 1;
}

.record-type {
  font-weight: 600;
  min-width: 32px;
}

.record-duration {
  color: #555;
}

.record-time {
  margin-left: auto;
  color: #aaa;
  font-size: 12px;
}

.empty-hint {
  text-align: center;
  color: #bbb;
  font-size: 14px;
  padding: 40px 0;
}
</style>


