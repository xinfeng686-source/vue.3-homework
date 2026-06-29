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
    component: () => import('@/views/Tools.vue'),
    meta: { title: '工具箱' },
    children: [
      {
        path: '',
        name: 'ToolsHome',
        component: () => import('@/views/ToolsHome.vue'),
        meta: { title: '工具箱' }
      },
      {
        path: 'calculator',
        name: 'ToolsCalculator',
        component: () => import('@/views/ToolsCalculator.vue'),
        meta: { title: '计算器' }
      },
      {
        path: 'countdown',
        name: 'ToolsCountdown',
        component: () => import('@/views/ToolsCountdown.vue'),
        meta: { title: '倒计时' }
      },
      {
        path: 'converter',
        name: 'ToolsConverter',
        component: () => import('@/views/ToolsUnitConverter.vue'),
        meta: { title: '单位换算' }
      },
      {
        path: 'json',
        name: 'ToolsJson',
        component: () => import('@/views/ToolsJsonFormatter.vue'),
        meta: { title: 'JSON 格式化' }
      },
      {
        path: 'world-clock',
        name: 'ToolsWorldClock',
        component: () => import('@/views/ToolsWorldClock.vue'),
        meta: { title: '世界时钟' }
      },
      {
        path: 'encoder',
        name: 'ToolsEncoder',
        component: () => import('@/views/ToolsEncoder.vue'),
        meta: { title: '编解码' }
      },
      {
        path: 'password',
        name: 'ToolsPassword',
        component: () => import('@/views/ToolsPasswordGenerator.vue'),
        meta: { title: '密码生成' }
      }
    ]
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
