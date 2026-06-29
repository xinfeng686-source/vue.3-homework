<template>
  <div class="tools-layout">
    <header class="topbar">
      <router-link to="/" class="topbar-link">&larr; 返回首页</router-link>
    </header>
    <router-view />
  </div>
</template>

<script setup>
</script>

<style scoped>
.tools-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.topbar {
  display: flex;
  align-items: center;
  padding: 14px 24px;
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 10;
}

.topbar-link {
  color: #3498db;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.2s;
}
.topbar-link:hover {
  opacity: 0.75;
}
</style>
