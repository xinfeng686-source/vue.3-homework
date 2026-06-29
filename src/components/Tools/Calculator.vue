<template>
  <div class="calculator">
    <!-- 显示屏 -->
    <div class="display" :class="{ error: isError }">
      {{ display }}
    </div>

    <!-- 按钮面板 -->
    <div class="keypad">
      <button class="key key-op"  @click="handleOperator('÷')">÷</button>
      <button class="key key-op"  @click="handleOperator('×')">×</button>
      <button class="key key-op"  @click="handleOperator('−')">−</button>
      <button class="key key-op"  @click="handleOperator('+')">+</button>

      <button class="key key-num" @click="inputDigit(7)">7</button>
      <button class="key key-num" @click="inputDigit(8)">8</button>
      <button class="key key-num" @click="inputDigit(9)">9</button>
      <button class="key key-fn"  @click="handleClear">C</button>

      <button class="key key-num" @click="inputDigit(4)">4</button>
      <button class="key key-num" @click="inputDigit(5)">5</button>
      <button class="key key-num" @click="inputDigit(6)">6</button>
      <button class="key key-fn"  @click="handleBackspace">⌫</button>

      <button class="key key-num" @click="inputDigit(1)">1</button>
      <button class="key key-num" @click="inputDigit(2)">2</button>
      <button class="key key-num" @click="inputDigit(3)">3</button>
      <button class="key key-eq"  @click="handleEquals">=</button>

      <button class="key key-num key-zero" @click="inputDigit(0)">0</button>
      <button class="key key-num" @click="inputDecimal">.</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// ============================================================
// 计算器核心状态机
// ------------------------------------------------------------
// 状态流转：
//
//  初始态                    按运算符              按等号
//  ──────►  输入第一个数  ──────►  等待第二个数  ──────►  显示结果
//  firstOperand=null        firstOperand=当前值   计算 first op second
//  operator=null            operator=选中的运算符  显示结果
//  waiting=false            waiting=true          回到"等待"态
//
// 关键规则：
// 1. 每次按键都从 display 反馈，用户看到什么就是什么
// 2. 连续按运算符时提前结算上一步 (3+ → 按× → 自动算 3+, 然后等第二个数)
// 3. 按 = 后若再按数字，从头开始新的输入
// 4. 按 = 后若再按运算符，把结果当作第一个操作数继续
// 5. ÷0 时显示 "不能除以 0" 并清空内部状态
// 6. 小数点在同一个数中只能点一次
// ============================================================

const display = ref('0')
const currentInput = ref('0')
const firstOperand = ref(null)
const operator = ref(null)
const waitingForSecondOperand = ref(false)
const isError = ref(false)

// ---- 输入数字 ----
function inputDigit(digit) {
  isError.value = false
  if (waitingForSecondOperand.value) {
    // 刚按过运算符或等号，开始输入新数
    currentInput.value = String(digit)
    waitingForSecondOperand.value = false
  } else {
    // 继续追加
    if (currentInput.value === '0') {
      currentInput.value = String(digit)
    } else {
      currentInput.value += String(digit)
    }
  }
  display.value = currentInput.value
}

// ---- 小数点 ----
function inputDecimal() {
  isError.value = false
  if (waitingForSecondOperand.value) {
    currentInput.value = '0.'
    waitingForSecondOperand.value = false
    display.value = currentInput.value
    return
  }
  if (!currentInput.value.includes('.')) {
    currentInput.value += '.'
  }
  display.value = currentInput.value
}

// ---- 四则运算符 ----
function handleOperator(nextOp) {
  isError.value = false
  const inputVal = parseFloat(currentInput.value)

  if (firstOperand.value === null) {
    // 第一次按运算符：记下第一个数
    firstOperand.value = inputVal
  } else if (operator.value) {
    // 已经有运算符了：先结算前一步
    const result = compute(firstOperand.value, inputVal, operator.value)
    if (result === 'ERROR') return
    display.value = formatResult(result)
    firstOperand.value = result
    currentInput.value = String(result)
  }

  operator.value = nextOp
  waitingForSecondOperand.value = true
}

// ---- 等号 ----
function handleEquals() {
  if (operator.value === null) return
  if (isError.value) return

  const inputVal = parseFloat(currentInput.value)
  const result = compute(firstOperand.value, inputVal, operator.value)

  if (result === 'ERROR') return

  display.value = formatResult(result)
  currentInput.value = String(result)
  firstOperand.value = null
  operator.value = null
  waitingForSecondOperand.value = true
}

// ---- 清除 ----
function handleClear() {
  display.value = '0'
  currentInput.value = '0'
  firstOperand.value = null
  operator.value = null
  waitingForSecondOperand.value = false
  isError.value = false
}

// ---- 退格 ----
function handleBackspace() {
  if (waitingForSecondOperand.value || isError.value) return
  if (currentInput.value.length > 1) {
    currentInput.value = currentInput.value.slice(0, -1)
  } else {
    currentInput.value = '0'
  }
  display.value = currentInput.value
}

// ---- 纯计算函数 ----
function compute(a, b, op) {
  switch (op) {
    case '+': return a + b
    case '−': return a - b
    case '×': return a * b
    case '÷':
      if (b === 0) {
        isError.value = true
        display.value = '不能除以 0'
        // 清空内部状态，用户必须按 C 重新开始
        firstOperand.value = null
        operator.value = null
        currentInput.value = '0'
        waitingForSecondOperand.value = true
        return 'ERROR'
      }
      return a / b
    default: return b
  }
}

// ---- 格式化输出 ----
function formatResult(val) {
  const s = String(parseFloat(val.toFixed(10)))
  return s
}
</script>

<style scoped>
.calculator {
  max-width: 280px;
  margin: 0 auto;
}

/* ---- 显示屏 ---- */
.display {
  background: #1e2a3a;
  color: #fff;
  font-size: 36px;
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  text-align: right;
  padding: 20px 16px;
  border-radius: 12px 12px 0 0;
  min-height: 76px;
  line-height: 1;
  letter-spacing: 2px;
  overflow-x: auto;
  white-space: nowrap;
}
.display.error {
  color: #e74c3c;
  font-size: 18px;
}

/* ---- 按钮面板 ---- */
.keypad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #ccc;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

.key {
  padding: 16px 0;
  border: none;
  font-size: 20px;
  cursor: pointer;
  transition: filter 0.12s;
  user-select: none;
}
.key:hover {
  filter: brightness(0.92);
}
.key:active {
  filter: brightness(0.82);
}

.key-num {
  background: #f5f5f5;
  color: #2c3e50;
}
.key-op {
  background: #f0b429;
  color: #fff;
}
.key-fn {
  background: #d5d8dc;
  color: #2c3e50;
}
.key-eq {
  background: #e67e22;
  color: #fff;
  grid-row: span 2;
}

.key-zero {
  grid-column: span 2;
}
</style>
