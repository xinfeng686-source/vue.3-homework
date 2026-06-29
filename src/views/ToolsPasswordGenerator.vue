<template>
  <div class="tool-page">
    <router-link to="/tools" class="back-link">← 返回工具箱</router-link>
    <h2 class="tool-title">🔑 密码生成器</h2>

    <div class="pw-card">
      <!-- 长度 -->
      <div class="pw-row">
        <label class="pw-label">密码长度：<strong>{{ length }}</strong></label>
        <input
          v-model.number="length"
          type="range"
          min="6" max="32"
          class="pw-slider"
        />
        <div class="pw-range-labels">
          <span>6</span>
          <span>32</span>
        </div>
      </div>

      <!-- 选项 -->
      <div class="pw-row pw-opts">
        <label class="pw-check">
          <input type="checkbox" v-model="useUpper" />
          大写字母 (A-Z)
        </label>
        <label class="pw-check">
          <input type="checkbox" v-model="useDigits" />
          数字 (0-9)
        </label>
        <label class="pw-check">
          <input type="checkbox" v-model="useSymbols" />
          特殊字符 (!&#64;#$%…)
        </label>
      </div>

      <!-- 生成 -->
      <button class="btn-gen" @click="generate">生成密码</button>

      <!-- 结果 -->
      <div v-if="password" class="pw-result">
        <div class="pw-result-box">
          <code class="pw-text">{{ password }}</code>
          <span class="pw-strength">{{ strengthLabel }}</span>
        </div>
        <button class="btn-copy" @click="copyPassword">📋 复制</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ============================================================
// 密码生成器
// ------------------------------------------------------------
// 从选中的字符集中随机取字符拼接。每次调用 generate()
// 都会使用 Math.random() 重新选取，确保结果不同。
//
// 强度评估规则：
//   长度 >= 12 且使用所有 4 类字符 → 强
//   长度 >= 8  → 中
//   否则 → 弱
// ============================================================

const length = ref(12)
const useUpper = ref(true)
const useDigits = ref(true)
const useSymbols = ref(true)
const password = ref('')

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS    = '0123456789'
const SYMBOLS   = '!@#$%^&*()_+-=[]{}|;:,.<>?'

function generate() {
  let pool = LOWERCASE
  if (useUpper.value)  pool += UPPERCASE
  if (useDigits.value) pool += DIGITS
  if (useSymbols.value)pool += SYMBOLS

  if (!pool) {
    password.value = '请至少选择一种字符类型'
    return
  }

  let result = ''
  for (let i = 0; i < length.value; i++) {
    result += pool[Math.floor(Math.random() * pool.length)]
  }
  password.value = result
}

const strengthLabel = computed(() => {
  const len = length.value
  const all = useUpper.value && useDigits.value && useSymbols.value
  if (len >= 12 && all) return '💪 强'
  if (len >= 8)         return '👌 中'
  return '👶 弱'
})

async function copyPassword() {
  try {
    await navigator.clipboard.writeText(password.value)
    alert('已复制到剪贴板')
  } catch {
    const ta = document.createElement('textarea')
    ta.value = password.value
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

.pw-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pw-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pw-label {
  font-size: 14px;
  color: #555;
}
.pw-label strong {
  color: #2c3e50;
  font-size: 18px;
}

.pw-slider {
  width: 100%;
  accent-color: #3498db;
}

.pw-range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #aaa;
}

.pw-opts {
  gap: 4px;
}
.pw-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  padding: 6px 0;
}
.pw-check input {
  accent-color: #3498db;
}

.btn-gen {
  padding: 12px 0;
  border: none;
  border-radius: 10px;
  background: #3498db;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-gen:hover { opacity: 0.85; }

.pw-result {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pw-result-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: #1e2a3a;
  border-radius: 10px;
}
.pw-text {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 18px;
  color: #f8f8f2;
  word-break: break-all;
  line-height: 1.4;
}
.pw-strength {
  font-size: 13px;
  white-space: nowrap;
}

.btn-copy {
  padding: 10px 0;
  border: none;
  border-radius: 8px;
  background: #9b59b6;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-copy:hover { opacity: 0.85; }
</style>
