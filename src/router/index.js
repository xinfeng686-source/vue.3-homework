import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '仪表盘' }
  },
  {
    path: '/pomodoro',
    name: 'Pomodoro',
    component: () => import('@/views/Pomodoro.vue'),
    meta: { title: '番茄钟' }
  },
  {
    path: '/tools',
    name: 'Tools',
    component: () => import('@/views/Tools.vue'),
    meta: { title: '工具集' }
  },
  {
    path: '/countdown',
    name: 'Countdown',
    component: () => import('@/views/Countdown.vue'),
    meta: { title: '倒计时' }
  },
  {
    path: '/quotes',
    name: 'Quotes',
    component: () => import('@/views/Quotes.vue'),
    meta: { title: '每日名言' }
  },
  {
    path: '/records',
    name: 'Records',
    component: () => import('@/views/Records.vue'),
    meta: { title: '记录' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
