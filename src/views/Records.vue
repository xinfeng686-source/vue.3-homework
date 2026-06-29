<template>
  <div class="records-page">
    <!-- 返回首页 -->
    <router-link to="/" class="back-link">&larr; 返回首页</router-link>

    <!-- 标题 -->
    <header class="page-header">
      <h1 class="page-title">&#128211; 任务看板 <span class="record-badge">共 {{ tasks.length }} 条记录</span>
      </h1>
      <p class="page-subtitle">记录生活，管理待办</p>
    </header>

    <!-- ====== 【增】录入区 ====== -->
    <div class="input-row">
      <input
        v-model="newTitle"
        class="task-input glass"
        placeholder="输入新任务…"
        @keyup.enter="handleAdd"
      />
      <button class="btn-add" :disabled="!newTitle.trim() || adding" @click="handleAdd">
        {{ adding ? '添加中…' : '添加任务' }}
      </button>
    </div>

    <!-- ====== 【查】列表区 ====== -->
    <section class="list-section">
      <div v-if="loading" class="status-hint">加载中…</div>

      <div v-else-if="!tasks.length" class="status-hint empty">
        还没有任务，在上面添加一条吧
      </div>

      <TransitionGroup v-else name="list" tag="div" class="task-list">
        <div
          v-for="task in tasks"
          :key="task.id"
          class="task-card glass"
          :class="{ done: task.completed }"
        >
          <!-- 左侧：状态切换 【改】 -->
          <button
            class="toggle-btn"
            :class="{ checked: task.completed }"
            @click="handleToggle(task)"
            :title="task.completed ? '标记为未完成' : '标记为已完成'"
          >
            <span v-if="task.completed">&#10003;</span>
          </button>

          <!-- 中间：任务文本 / 行内编辑框 【改】 -->
          <div class="task-body" @click="startEdit(task)">
            <template v-if="editingId === task.id">
              <input
                v-model="editValue"
                class="edit-input"
                ref="editInputRef"
                @keyup.enter="saveEdit(task)"
                @keyup.escape="cancelEdit"
                @blur="saveEdit(task)"
              />
            </template>
            <template v-else>
              <span class="task-title" :class="{ line: task.completed }">{{ task.title }}</span>
            </template>
          </div>

          <!-- 右侧：删除 【删】 -->
          <button
            class="del-btn"
            title="删除任务"
            @click="handleDelete(task)"
          >&#128465;</button>
        </div>
      </TransitionGroup>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

function syncTaskStats() {
  const pending = tasks.value.filter((t) => !t.completed).length
  appStore.updateTaskStats(pending, tasks.value.length)
}

// ============================================================
// 任务看板 — 完整 CRUD
// ------------------------------------------------------------
// 数据存于 localStorage（key: "lifeos_tasks"），通过 4 个 mock
// 异步函数模拟 Axios 请求（Promise + setTimeout 300ms）。
//
// 后续对接真实后端时只需替换这 4 个函数体内的逻辑，
// 将 localStorage 读写换成 request.get/post/put/delete 即可。
// ============================================================

const LS_KEY = 'lifeos_tasks'

const tasks = ref([])
const loading = ref(true)

// 新增
const newTitle = ref('')
const adding = ref(false)

// 行内编辑
const editingId = ref(null)
const editValue = ref('')
const editInputRef = ref(null)

// ++++++++ 工具函数 ++++++++

function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || []
  } catch {
    return []
  }
}

function saveToStorage(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data))
}

// ++++++++ Mock API（模拟 Axios 异步请求） ++++++++

// ---- 【查】获取全部任务 ----
function mockFetchTasks() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(loadFromStorage())
    }, 300)
  })
}

// ---- 【增】添加新任务 ----
function mockAddTask(title) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const list = loadFromStorage()
      const task = { id: Date.now(), title: title.trim(), completed: false }
      list.unshift(task)
      saveToStorage(list)
      resolve(task)
    }, 300)
  })
}

// ---- 【改】切换完成状态 ----
function mockToggleTask(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const list = loadFromStorage()
      const task = list.find((t) => t.id === id)
      if (task) {
        task.completed = !task.completed
        saveToStorage(list)
        resolve(task)
      } else {
        resolve(null)
      }
    }, 300)
  })
}

// ---- 【改】更新任务标题 ----
function mockUpdateTitle(id, newTitle) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const list = loadFromStorage()
      const task = list.find((t) => t.id === id)
      if (task) {
        task.title = newTitle.trim()
        saveToStorage(list)
        resolve(task)
      } else {
        resolve(null)
      }
    }, 300)
  })
}

// ---- 【删】删除任务 ----
function mockDeleteTask(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const list = loadFromStorage().filter((t) => t.id !== id)
      saveToStorage(list)
      resolve(true)
    }, 300)
  })
}

// ++++++++ 页面操作函数 ++++++++

// 页面加载时读取列表
onMounted(() => {
  mockFetchTasks()
    .then((data) => {
      tasks.value = data; syncTaskStats()
    })
    .finally(() => {
      loading.value = false
    })
})

// ---- 增 ----
function handleAdd() {
  const title = newTitle.value.trim()
  if (!title) return

  adding.value = true
  mockAddTask(title)
    .then(() => {
      newTitle.value = ''
      // 重新获取最新列表
      return mockFetchTasks()
    })
    .then((data) => {
      tasks.value = data; syncTaskStats()
    })
    .finally(() => {
      adding.value = false
    })
}

// ---- 改：切换状态 ----
function handleToggle(task) {
  mockToggleTask(task.id)
    .then(() => mockFetchTasks())
    .then((data) => {
      tasks.value = data; syncTaskStats()
    })
}

// ---- 改：行内编辑 ----
function startEdit(task) {
  if (task.completed) return
  editingId.value = task.id
  editValue.value = task.title
  nextTick(() => {
    if (editInputRef.value) editInputRef.value.focus()
  })
}

function cancelEdit() {
  editingId.value = null
  editValue.value = ''
}

function saveEdit(task) {
  const val = editValue.value.trim()
  if (!val || val === task.title) {
    cancelEdit()
    return
  }
  mockUpdateTitle(task.id, val)
    .then(() => mockFetchTasks())
    .then((data) => {
      tasks.value = data; syncTaskStats()
      cancelEdit()
    })
}

// ---- 删 ----
function handleDelete(task) {
  const ok = confirm(`确定删除「${task.title}」吗？`)
  if (!ok) return

  mockDeleteTask(task.id)
    .then(() => mockFetchTasks())
    .then((data) => {
      tasks.value = data; syncTaskStats()
    })
}
</script>

<style scoped>
.records-page {
  min-height: 100vh;
  max-width: 560px;
  margin: 0 auto;
  padding: 32px 20px 80px;
  background: linear-gradient(145deg, #fef9f4 0%, #f8f0e6 50%, #f0f4f8 100%);
}

/* ---- 毛玻璃共用 ---- */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

/* ---- 返回 ---- */
.back-link {
  display: inline-block;
  color: #3498db;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 8px;
}
.back-link:hover { text-decoration: underline; }

/* ---- 标题 ---- */
.page-header {
  margin-bottom: 28px;
}
.page-title {
  font-size: 26px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.record-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 500;
  color: #888;
  background: #f0f0f0;
  padding: 2px 10px;
  border-radius: 10px;
  margin-left: 10px;
  vertical-align: middle;
}

.page-subtitle {
  font-size: 14px;
  color: #999;
}

/* ---- 【增】录入区 ---- */
.input-row {
  display: flex;
  gap: 10px;
  margin-bottom: 28px;
}

.task-input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  font-size: 15px;
  outline: none;
  color: #2c3e50;
  transition: box-shadow 0.2s;
}
.task-input::placeholder { color: #bbb; }
.task-input:focus {
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
}

.btn-add {
  padding: 12px 20px;
  border: none;
  border-radius: 14px;
  background: #3498db;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s;
}
.btn-add:hover { opacity: 0.85; }
.btn-add:disabled { opacity: 0.4; cursor: not-allowed; }

/* ---- 列表区 ---- */
.list-section {
  min-height: 200px;
}

.status-hint {
  text-align: center;
  font-size: 14px;
  color: #bbb;
  padding: 48px 0;
}
.status-hint.empty { color: #ccc; }

.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ---- 任务卡片 ---- */
.task-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}
.task-card.done {
  opacity: 0.65;
}

/* 左侧：状态切换 */
.toggle-btn {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid #ddd;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #fff;
  transition: all 0.2s;
  padding: 0;
}
.toggle-btn:hover { border-color: #27ae60; }
.toggle-btn.checked {
  background: #27ae60;
  border-color: #27ae60;
}

/* 中间：任务文本 */
.task-body {
  flex: 1;
  min-width: 0;
  cursor: text;
}
.task-title {
  font-size: 15px;
  color: #2c3e50;
  line-height: 1.5;
  word-break: break-word;
  display: block;
}
.task-title.line {
  text-decoration: line-through;
  color: #bbb;
}

/* 行内编辑框 */
.edit-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #3498db;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  background: #fff;
}

/* 右侧：删除 */
.del-btn {
  flex-shrink: 0;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.2;
  transition: opacity 0.2s;
  padding: 4px;
  line-height: 1;
}
.task-card:hover .del-btn { opacity: 0.5; }
.del-btn:hover { opacity: 0.8 !important; }

/* ---- 列表动画 ---- */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-move {
  transition: transform 0.3s ease;
}
</style>
