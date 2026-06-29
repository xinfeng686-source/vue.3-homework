<template>
  <div class="tool-page converter">
    <router-link to="/tools" class="back-link">← 返回工具箱</router-link>
    <h2 class="tool-title">📏 单位换算</h2>

    <!-- 类别选择 -->
    <div class="cat-tabs">
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="cat-btn"
        :class="{ active: category === cat.key }"
        @click="category = cat.key"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- 换算面板 -->
    <div class="converter-panel">
      <div class="row">
        <input v-model.number="inputValue" type="number" min="0" placeholder="输入数值" class="input-num" />
        <select v-model="fromUnit" class="select-unit">
          <option v-for="(label, key) in currentUnits" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>

      <div class="eq-sign">=</div>

      <div class="row">
        <output class="result-num">{{ formattedResult }}</output>
        <select v-model="toUnit" class="select-unit">
          <option v-for="(label, key) in currentUnits" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ============================================================
// 单位换算核心逻辑
// ------------------------------------------------------------
// 方案：所有单位以"基准单位"为中介做二次换算。
//
//   fromValue × (fromRatio / toRatio) = result
//
// 例如 5 英尺 → 米：
//   5 × (0.3048 / 1) = 1.524
//
// 长度基准 = 米（m = 1）
// 重量基准 = 克（g = 1）
// ============================================================

const categories = [
  { key: 'length', label: '长度' },
  { key: 'weight', label: '重量' },
]

const conversionRates = {
  length: { mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, foot: 0.3048, yard: 0.9144, mile: 1609.344 },
  weight: { mg: 0.001, g: 1, kg: 1000, ton: 1e6, oz: 28.3495, lb: 453.592 },
}

const unitLabels = {
  length: { mm: '毫米', cm: '厘米', m: '米', km: '千米', inch: '英寸', foot: '英尺', yard: '码', mile: '英里' },
  weight: { mg: '毫克', g: '克', kg: '千克', ton: '吨', oz: '盎司', lb: '磅' },
}

const category = ref('length')
const inputValue = ref(1)
const fromUnit = ref('m')
const toUnit = ref('cm')

const currentUnits = computed(() => unitLabels[category.value])

// 当切换类别时，重置单位选择
const prevCategory = ref('length')
const defaultUnits = { length: ['m', 'cm'], weight: ['kg', 'g'] }

// 使用 watch 逻辑：每次 category 变化时重置
import { watch } from 'vue'
watch(category, (val) => {
  const [defFrom, defTo] = defaultUnits[val]
  if (fromUnit.value !== defFrom && !(fromUnit.value in conversionRates[val])) {
    fromUnit.value = defFrom
  }
  if (toUnit.value !== defTo && !(toUnit.value in conversionRates[val])) {
    toUnit.value = defTo
  }
})

const result = computed(() => {
  const rates = conversionRates[category.value]
  if (!rates || inputValue.value === '' || isNaN(inputValue.value)) return 0
  const base = inputValue.value * rates[fromUnit.value]
  return base / rates[toUnit.value]
})

const formattedResult = computed(() => {
  const r = result.value
  if (r === 0) return '0'
  // 避免浮点过长
  return parseFloat(r.toFixed(10)).toString()
})
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

/* ---- 类别切换 ---- */
.cat-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}
.cat-btn {
  padding: 8px 24px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.cat-btn.active {
  background: #3498db;
  color: #fff;
  border-color: #3498db;
}
.cat-btn:not(.active):hover {
  background: #f0f0f0;
}

/* ---- 换算面板 ---- */
.converter-panel {
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  width: 100%;
  max-width: 400px;
}

.row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.input-num {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 18px;
  text-align: right;
  outline: none;
}
.input-num:focus {
  border-color: #3498db;
}

.select-unit {
  padding: 10px 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: #fafafa;
  outline: none;
  cursor: pointer;
}

.eq-sign {
  text-align: center;
  font-size: 24px;
  color: #888;
  padding: 12px 0;
}

.result-num {
  flex: 1;
  padding: 10px 14px;
  font-size: 22px;
  font-weight: 600;
  text-align: right;
  color: #2c3e50;
}
</style>
