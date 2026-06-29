<template>
  <div class="tools-home">
    <header class="page-header">
      <h1>工具箱</h1>
      <p class="page-subtitle">选择工具开始使用</p>
    </header>

    <div class="app-grid">
      <router-link
        v-for="app in apps"
        :key="app.to"
        :to="app.to"
        class="app-card"
      >
        <span class="app-icon">{{ app.icon }}</span>
        <span class="app-title">{{ app.title }}</span>
        <span class="app-desc">{{ app.desc }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
const apps = [
  { to: '/tools/calculator', icon: '🧮', title: '计算器',        desc: '基础四则运算' },
  { to: '/tools/countdown',  icon: '⏱', title: '倒计时',        desc: '精准计时工具' },
  { to: '/tools/converter',  icon: '📏', title: '单位换算',      desc: '长度 / 重量换算' },
  { to: '/tools/json',       icon: '{ }',title: 'JSON 格式化',   desc: '格式化与语法高亮' },
  { to: '/tools/world-clock',icon: '🌍', title: '世界时钟',      desc: '多时区实时时间' },
  { to: '/tools/encoder',    icon: '🔐', title: '编解码工具',    desc: 'Base64 / URL 编解码' },
  { to: '/tools/password',   icon: '🔑', title: '密码生成器',    desc: '随机密码生成' },
]
</script>

<style scoped>
.tools-home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 48px;
}
.page-header h1 {
  font-size: 30px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}
.page-subtitle {
  font-size: 15px;
  color: #888;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  max-width: 680px;
  width: 100%;
}

.app-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 32px 16px 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  text-decoration: none;
  color: #2c3e50;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  cursor: pointer;
}
.app-card:hover {
  transform: translateY(-5px) scale(1.04);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.10);
}

.app-icon {
  font-size: 40px;
  line-height: 1;
}
.app-title {
  font-size: 16px;
  font-weight: 600;
}
.app-desc {
  font-size: 12px;
  color: #999;
}
</style>
