<template>
  <div class="tool-page json-page">
    <router-link to="/tools" class="back-link">← 返回工具箱</router-link>
    <h2 class="tool-title">{ } JSON 格式化</h2>

    <div class="json-workspace">
      <!-- 输入区 -->
      <div class="json-panel">
        <label class="panel-label">输入 JSON</label>
        <textarea
          v-model="inputJson"
          class="json-input"
          placeholder='{"name":"Alice","age":30}'
          rows="6"
        ></textarea>
      </div>

      <!-- 操作按钮 -->
      <div class="json-actions">
        <button class="btn-format" @click="formatJson">格式化</button>
        <button class="btn-minify" @click="minifyJson">压缩</button>
        <button class="btn-clear" @click="clearJson">清空</button>
        <button v-if="outputJson" class="btn-copy" @click="copyResult">复制</button>
      </div>

      <!-- 输出区 -->
      <div class="json-panel">
        <label class="panel-label">输出</label>
        <div v-if="errorMsg" class="json-error">{{ errorMsg }}</div>
        <pre v-else-if="outputJson" class="json-output"><code v-html="highlightedJson"></code></pre>
        <div v-else class="json-placeholder">等待输入…</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ============================================================
// JSON 格式化核心逻辑
// ------------------------------------------------------------
// 响应式数据流：
//
//   inputJson (ref) ──→ JSON.parse() ──→ outputJson (ref)
//       │                                      │
//       │    parse 失败 → errorMsg              │
//       │                                      ▼
//       │                              syntaxHighlight()
//       │                                      │
//       │                                      ▼
//       │                              highlightedJson (computed)
//       │                                      │
//       │                                      ▼
//       │                              v-html 渲染到 <pre>
//
// 语法高亮用纯正则匹配：键 / 字符串 / 数字 / 布尔 / null
// 各自套上不同颜色的 <span>，通过 v-html 输出。
// 注意：输出完全由我们自己生成（非用户原始输入），
// 所以 v-html 是安全的。
// ============================================================

const inputJson = ref('')
const outputJson = ref('')
const errorMsg = ref('')

// ---- 格式化 ----
function formatJson() {
  errorMsg.value = ''
  if (!inputJson.value.trim()) {
    outputJson.value = ''
    return
  }
  try {
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed, null, 2)
  } catch (e) {
    errorMsg.value = `❌ 无效 JSON：${e.message}`
    outputJson.value = ''
  }
}

// ---- 压缩 ----
function minifyJson() {
  errorMsg.value = ''
  if (!inputJson.value.trim()) { outputJson.value = ''; return }
  try {
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed)
  } catch (e) {
    errorMsg.value = `❌ 无效 JSON：${e.message}`
    outputJson.value = ''
  }
}

// ---- 清空 ----
function clearJson() {
  inputJson.value = ''
  outputJson.value = ''
  errorMsg.value = ''
}

// ---- 复制 ----
async function copyResult() {
  try {
    await navigator.clipboard.writeText(outputJson.value)
    alert('已复制到剪贴板')
  } catch {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = outputJson.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}

// ---- 语法高亮 ----
const highlightedJson = computed(() => {
  if (!outputJson.value) return ''
  return syntaxHighlight(outputJson.value)
})

function syntaxHighlight(json) {
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped.replace(
    /("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (_match, str, colon, kw, num) => {
      if (colon) return `<span class="hl-key">${str}</span>${colon}`
      if (str)  return `<span class="hl-str">${str}</span>`
      if (kw === 'true' || kw === 'false') return `<span class="hl-bool">${kw}</span>`
      if (kw === 'null') return `<span class="hl-null">${kw}</span>`
      if (num !== undefined) return `<span class="hl-num">${num}</span>`
      return _match
    }
  )
}
</script>

<style scoped>
.tool-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px 60px;
}
.back-link {
  align-self: flex-start;
  color: #3498db;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 8px;
}
.back-link:hover { text-decoration: underline; }
.tool-title {
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 28px;
}

/* ---- 工作区 ---- */
.json-workspace {
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.json-panel {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}

.panel-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
}

.json-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}
.json-input:focus {
  border-color: #3498db;
}

.json-actions {
  display: flex;
  gap: 8px;
}
.json-actions button {
  padding: 8px 18px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.json-actions button:hover { opacity: 0.85; }
.btn-format { background: #3498db; color: #fff; }
.btn-minify { background: #2ecc71; color: #fff; }
.btn-clear  { background: #bdc3c7; color: #2c3e50; }
.btn-copy   { background: #9b59b6; color: #fff; }

.json-error {
  color: #e74c3c;
  font-size: 14px;
  padding: 8px 0;
}

.json-output {
  background: #1e2a3a;
  color: #f8f8f2;
  padding: 16px;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre;
  margin: 0;
  min-height: 60px;
}

.json-placeholder {
  color: #aaa;
  font-size: 14px;
  padding: 20px 0;
  text-align: center;
}

/* ---- JSON 语法高亮颜色 ---- */
:deep(.hl-key)  { color: #f39c12; }  /* 键名 */
:deep(.hl-str)  { color: #2ecc71; }  /* 字符串 */
:deep(.hl-num)  { color: #3498db; }  /* 数字 */
:deep(.hl-bool) { color: #9b59b6; }  /* true/false */
:deep(.hl-null) { color: #e74c3c; }  /* null */
</style>
