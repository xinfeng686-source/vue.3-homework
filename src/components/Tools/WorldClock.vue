<template>
  <div class="wc">
    <!-- ====== 添加表单（折叠式） ====== -->
    <div class="add-section">
      <button class="add-toggle" @click="showForm = !showForm">
        {{ showForm ? '收起' : '+' }} 添加自定义时区
      </button>

      <Transition name="slide">
        <div v-if="showForm" class="add-form">
          <div class="form-row">
            <label>
              <span>时区</span>
              <select v-model="formTimezone" class="form-select">
                <option disabled value="">— 请选择 —</option>
                <option v-for="tz in commonTimezones" :key="tz.value" :value="tz.value">
                  {{ tz.label }}
                </option>
              </select>
            </label>
            <label>
              <span>备注名称</span>
              <input v-model="formLabel" class="form-input" placeholder="例如：北美分部" />
            </label>
          </div>
          <div class="form-actions">
            <button class="btn-submit" :disabled="!formTimezone || submitting" @click="handleAdd">
              {{ submitting ? '提交中…' : '确认添加' }}
            </button>
          </div>
          <p v-if="addError" class="form-error">{{ addError }}</p>
        </div>
      </Transition>
    </div>

    <!-- ====== 默认时区 ====== -->
    <h3 class="section-title">默认时区</h3>
    <div class="clock-grid">
      <div v-for="loc in defaults" :key="loc.id" class="clock-card">
        <span class="card-city">{{ loc.name }}</span>
        <span class="card-time">{{ formatTime(loc.timezone) }}</span>
        <span class="card-date">{{ formatDate(loc.timezone) }}</span>
        <span class="card-offset">{{ loc.offset }}</span>
      </div>
    </div>

    <!-- ====== 自定义时区 ====== -->
    <h3 v-if="customList.length" class="section-title">
      自定义时区
      <span class="badge">{{ customList.length }}</span>
    </h3>
    <div v-if="customList.length" class="clock-grid">
      <div v-for="item in customList" :key="item.id" class="clock-card custom" :class="{ editing: editingId === item.id }">
        <!-- 编辑状态：行内修改备注 -->
        <template v-if="editingId === item.id">
          <input
            v-model="editValue"
            class="edit-input"
            @keyup.enter="saveEdit(item)"
            @keyup.escape="cancelEdit"
            ref="editInputRef"
          />
          <div class="edit-actions">
            <button class="act-sm act-save" @click="saveEdit(item)">保存</button>
            <button class="act-sm act-cancel" @click="cancelEdit">取消</button>
          </div>
        </template>

        <!-- 正常展示 -->
        <template v-else>
          <button class="del-btn" title="删除" @click="confirmDelete(item)">✕</button>
          <span class="card-city">{{ item.label || item.name }}</span>
          <span class="card-time">{{ formatTime(item.timezone) }}</span>
          <span class="card-date">{{ formatDate(item.timezone) }}</span>
          <span class="card-offset">{{ item.offset || '' }}</span>
          <button class="edit-btn" title="修改备注" @click="startEdit(item)">✎ 备注</button>
        </template>

        <!-- 删除确认 -->
        <div v-if="deletingId === item.id" class="delete-overlay">
          <span>确认删除？</span>
          <button class="act-sm act-save" @click="handleDelete(item)">是</button>
          <button class="act-sm act-cancel" @click="deletingId = null">否</button>
        </div>
      </div>
    </div>

    <!-- ====== 空状态 ====== -->
    <p v-if="!customList.length && !loading" class="empty-hint">
      还没有自定义时区，点击上方按钮添加
    </p>
    <p v-if="loading" class="loading-hint">加载中…</p>
    <p v-if="fetchError" class="fetch-error">{{ fetchError }}</p>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import request from '@/api/request'

// ============================================================
// 世界时钟 CRUD 组件
// ------------------------------------------------------------
// 数据流：
//   GET  /api/timezones   → customList (ref)
//   POST /api/timezones   → 添加 → 重新 GET
//   PUT  /api/timezones/:id → 更新 → 重新 GET
//   DELETE /api/timezones/:id → 删除 → 重新 GET
//
// 每次 CURD 成功后都重新 fetch 全量列表，保证与后端数据一致。
// 默认时区在本地硬编码，不与后端交互。
//
// 定时器：
//   onMounted  → setInterval(1s)
//   onUnmounted → clearInterval   ← 内存泄漏防线
// ============================================================

// ------- 默认时区（本地，不做增删改） -------
const defaults = [
  { id: 'd-bj', name: '北京',   timezone: 'Asia/Shanghai',        offset: 'UTC+8' },
  { id: 'd-tk', name: '东京',   timezone: 'Asia/Tokyo',           offset: 'UTC+9' },
  { id: 'd-ld', name: '伦敦',   timezone: 'Europe/London',        offset: 'UTC+0/+1' },
  { id: 'd-la', name: '洛杉矶', timezone: 'America/Los_Angeles',   offset: 'UTC-8/-7' },
  { id: 'd-ny', name: '纽约',   timezone: 'America/New_York',     offset: 'UTC-5/-4' },
]

const commonTimezones = [
  { label: '纽约 (UTC-5)',     value: 'America/New_York' },
  { label: '芝加哥 (UTC-6)',   value: 'America/Chicago' },
  { label: '丹佛 (UTC-7)',     value: 'America/Denver' },
  { label: '洛杉矶 (UTC-8)',   value: 'America/Los_Angeles' },
  { label: '伦敦 (UTC+0)',     value: 'Europe/London' },
  { label: '巴黎 (UTC+1)',     value: 'Europe/Paris' },
  { label: '柏林 (UTC+1)',     value: 'Europe/Berlin' },
  { label: '莫斯科 (UTC+3)',   value: 'Europe/Moscow' },
  { label: '迪拜 (UTC+4)',     value: 'Asia/Dubai' },
  { label: '孟买 (UTC+5:30)',  value: 'Asia/Kolkata' },
  { label: '曼谷 (UTC+7)',     value: 'Asia/Bangkok' },
  { label: '新加坡 (UTC+8)',   value: 'Asia/Singapore' },
  { label: '北京 (UTC+8)',     value: 'Asia/Shanghai' },
  { label: '东京 (UTC+9)',     value: 'Asia/Tokyo' },
  { label: '首尔 (UTC+9)',     value: 'Asia/Seoul' },
  { label: '悉尼 (UTC+11)',    value: 'Australia/Sydney' },
  { label: '奥克兰 (UTC+12)',  value: 'Pacific/Auckland' },
]

// ------- 响应式状态 -------
const customList = ref([])
const now = ref(new Date())
const loading = ref(true)
const fetchError = ref('')
const submitting = ref(false)
const addError = ref('')

// 表单
const showForm = ref(false)
const formTimezone = ref('')
const formLabel = ref('')

// 编辑
const editingId = ref(null)
const editValue = ref('')
const editInputRef = ref(null)

// 删除确认
const deletingId = ref(null)

// ------- 定时器 -------
let timerId = null

onMounted(() => {
  fetchTimezones()
  timerId = setInterval(() => { now.value = new Date() }, 1000)
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})

// ------- 时间格式化 -------
function formatTime(tz) {
  return now.value.toLocaleTimeString('zh-CN', {
    timeZone: tz, hour12: false,
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}
function formatDate(tz) {
  return now.value.toLocaleDateString('zh-CN', {
    timeZone: tz, weekday: 'short',
    month: '2-digit', day: '2-digit'
  })
}

// ++++++++ CRUD ++++++++

// ---- 查 GET ----
function fetchTimezones() {
  loading.value = true
  fetchError.value = ''
  request.get('/api/timezones')
    .then((data) => {
      customList.value = Array.isArray(data) ? data : []
    })
    .catch(() => {
      // 后端未启用时静默降级
      customList.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

// ---- 增 POST ----
function handleAdd() {
  if (!formTimezone.value) return
  submitting.value = true
  addError.value = ''

  const payload = {
    timezone: formTimezone.value,
    label: formLabel.value.trim() || '',
    name: formTimezone.value.split('/').pop() || formTimezone.value,
  }

  request.post('/api/timezones', payload)
    .then(() => {
      formTimezone.value = ''
      formLabel.value = ''
      showForm.value = false
      fetchTimezones()
    })
    .catch((err) => {
      addError.value = '添加失败，请稍后重试'
      console.error('Add timezone error:', err)
    })
    .finally(() => {
      submitting.value = false
    })
}

// ---- 改 PUT ----
function startEdit(item) {
  editingId.value = item.id
  editValue.value = item.label || item.name || ''
  nextTick(() => {
    if (editInputRef.value) editInputRef.value.focus()
  })
}

function cancelEdit() {
  editingId.value = null
  editValue.value = ''
}

function saveEdit(item) {
  if (editValue.value.trim() === (item.label || '')) {
    cancelEdit()
    return
  }
  request.put(`/api/timezones/${item.id}`, { label: editValue.value.trim() })
    .then(() => {
      cancelEdit()
      fetchTimezones()
    })
    .catch((err) => {
      console.error('Update error:', err)
    })
}

// ---- 删 DELETE ----
function confirmDelete(item) {
  deletingId.value = item.id
}

function handleDelete(item) {
  request.delete(`/api/timezones/${item.id}`)
    .then(() => {
      deletingId.value = null
      fetchTimezones()
    })
    .catch((err) => {
      console.error('Delete error:', err)
    })
}
</script>

<style scoped>
.wc { max-width: 700px; margin: 0 auto; }

/* ---- 添加区 ---- */
.add-section { margin-bottom: 28px; }
.add-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 18px;
  border: 1px dashed #3498db;
  border-radius: 8px;
  background: transparent;
  color: #3498db;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.add-toggle:hover { background: #eaf4fd; }

.add-form {
  margin-top: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}
.form-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.form-row label {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #555;
}
.form-select, .form-input {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}
.form-select:focus, .form-input:focus { border-color: #3498db; }

.form-actions { margin-top: 12px; }
.btn-submit {
  padding: 8px 24px;
  border: none;
  border-radius: 8px;
  background: #3498db;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-submit:not(:disabled):hover { opacity: 0.85; }

.form-error { color: #e74c3c; font-size: 13px; margin-top: 8px; }

/* 折叠动画 */
.slide-enter-active, .slide-leave-active { transition: all 0.25s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { opacity: 0; max-height: 0; padding: 0 16px; }

/* ---- 分区标题 ---- */
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #555;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.badge {
  background: #3498db;
  color: #fff;
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 10px;
}

/* ---- 卡片网格 ---- */
.clock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}

.clock-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 20px 10px 14px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s;
}
.clock-card:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.09); }
.clock-card.custom {
  border: 1px solid #e8f0fe;
}
.clock-card.editing {
  gap: 8px;
  padding-top: 16px;
}

.card-city  { font-size: 14px; font-weight: 700; color: #2c3e50; }
.card-time  { font-size: 26px; font-weight: 300; font-variant-numeric: tabular-nums; letter-spacing: 2px; color: #1e2a3a; }
.card-date  { font-size: 11px; color: #999; }
.card-offset { font-size: 10px; color: #bbb; background: #f5f5f5; padding: 1px 8px; border-radius: 8px; }

/* ---- 编辑 ---- */
.edit-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #3498db;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  outline: none;
}
.edit-actions, .edit-btn { display: flex; gap: 6px; }
.edit-btn {
  margin-top: 4px;
  padding: 2px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  font-size: 11px;
  cursor: pointer;
  color: #555;
}
.edit-btn:hover { background: #f0f0f0; }

.act-sm {
  padding: 3px 12px;
  border: none;
  border-radius: 5px;
  font-size: 12px;
  cursor: pointer;
}
.act-save { background: #27ae60; color: #fff; }
.act-cancel { background: #bdc3c7; color: #2c3e50; }

/* ---- 删除按钮 + 确认覆盖层 ---- */
.del-btn {
  position: absolute;
  top: 6px; right: 6px;
  width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  border: none;
  border-radius: 50%;
  background: #e74c3c;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}
.clock-card.custom:hover .del-btn { opacity: 1; }
.del-btn:hover { background: #c0392b; }

.delete-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(255,255,255,0.92);
  border-radius: 14px;
  font-size: 13px;
  color: #e74c3c;
  font-weight: 600;
}

/* ---- 状态提示 ---- */
.empty-hint, .loading-hint, .fetch-error {
  text-align: center;
  font-size: 13px;
  color: #999;
  margin-top: 12px;
}
.fetch-error { color: #e74c3c; }
</style>
