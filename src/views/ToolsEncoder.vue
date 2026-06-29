<template>
  <div class="tool-page encoder-page">
    <router-link to="/tools" class="back-link">← 返回工具箱</router-link>
    <h2 class="tool-title">🔐 编解码工具</h2>

    <div class="encoder-workspace">
      <!-- 输入 -->
      <div class="panel">
        <label class="panel-label">输入文本</label>
        <textarea
          v-model="input"
          class="code-input"
          placeholder="在此粘贴要编解码的内容…"
          rows="4"
        ></textarea>
      </div>

      <!-- 操作按钮 -->
      <div class="btn-group">
        <button class="btn enc" @click="base64Encode">Base64 编码</button>
        <button class="btn dec" @click="base64Decode">Base64 解码</button>
        <button class="btn enc" @click="urlEncode">URL 编码</button>
        <button class="btn dec" @click="urlDecode">URL 解码</button>
        <button class="btn clr" @click="clearAll">清空</button>
      </div>

      <!-- 输出 -->
      <div class="panel">
        <label class="panel-label">输出结果
          <button v-if="output" class="copy-btn" @click="copyResult">复制</button>
        </label>
        <textarea
          :value="output"
          class="code-input output-box"
          readonly
          rows="4"
          placeholder="结果将显示在这里…"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// ============================================================
// 编解码工具 — Base64 / URL
// ------------------------------------------------------------
// btoa() / atob() 只支持 Latin-1 字符。对于中文等 Unicode
// 文本，先用 encodeURIComponent 转为 ASCII 安全序列再
// Base64 编解码。（handleUnicode 标志控制）
//
// URL 编码直接使用内置的 encodeURIComponent / decodeURIComponent。
// ============================================================

const input = ref('')
const output = ref('')

function base64Encode() {
  if (!input.value) return
  try {
    // 先用 encodeURIComponent 处理中文
    const bytes = new TextEncoder().encode(input.value)
    const binary = Array.from(bytes).map(b => String.fromCodePoint(b)).join('')
    output.value = btoa(binary)
  } catch (e) {
    output.value = `编码失败：${e.message}`
  }
}

function base64Decode() {
  if (!input.value) return
  try {
    const binary = atob(input.value)
    const bytes = Uint8Array.from(binary, c => c.codePointAt(0))
    output.value = new TextDecoder().decode(bytes)
  } catch (e) {
    output.value = `解码失败：${e.message}`
  }
}

function urlEncode() {
  if (!input.value) return
  output.value = encodeURIComponent(input.value)
}

function urlDecode() {
  if (!input.value) return
  try {
    output.value = decodeURIComponent(input.value)
  } catch (e) {
    output.value = `解码失败：${e.message}`
  }
}

function clearAll() {
  input.value = ''
  output.value = ''
}

async function copyResult() {
  try {
    await navigator.clipboard.writeText(output.value)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = output.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
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

.encoder-workspace {
  width: 100%;
  max-width: 660px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}
.panel-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
}

.code-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  resize: vertical;
  outline: none;
}
.code-input:focus { border-color: #3498db; }
.output-box {
  background: #f8f9fa;
  cursor: default;
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn:hover { opacity: 0.85; }
.enc  { background: #3498db; color: #fff; }
.dec  { background: #27ae60; color: #fff; }
.clr  { background: #bdc3c7; color: #2c3e50; }
.copy-btn {
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
  cursor: pointer;
}
.copy-btn:hover { background: #f0f0f0; }
</style>
