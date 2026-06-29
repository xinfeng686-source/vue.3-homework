/**
 * 通用工具函数集合
 */

/**
 * 格式化日期
 * @param {Date|string|number} date  - 日期对象 / 字符串 / 时间戳
 * @param {string}              fmt   - 格式模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string}
 */
export function formatDate(date, fmt = 'YYYY-MM-DD HH:mm:ss') {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  const map = {
    'Y+': d.getFullYear(),
    'M+': d.getMonth() + 1,
    'D+': d.getDate(),
    'H+': d.getHours(),
    'm+': d.getMinutes(),
    's+': d.getSeconds()
  }
  let result = fmt
  for (const [k, v] of Object.entries(map)) {
    const regex = new RegExp(`(${k})`)
    result = result.replace(regex, (m) => (m.length === 1 ? String(v) : pad(v)))
  }
  return result
}

/**
 * 防抖
 * @param {Function} fn    - 要执行的函数
 * @param {number}   delay - 延迟毫秒数，默认 300
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

/**
 * 节流
 * @param {Function} fn       - 要执行的函数
 * @param {number}   interval - 间隔毫秒数，默认 300
 */
export function throttle(fn, interval = 300) {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last >= interval) {
      last = now
      fn.apply(this, args)
    }
  }
}
