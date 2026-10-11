import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Dialog } from 'vant'

import App from './App.vue'
import router from './router'

// 引入全局样式
import './assets/main.css'
// 引入vant组件库的样式
import 'vant/lib/index.css'

// 主题初始化
document.documentElement.dataset.theme = 'light'
try {
  if (localStorage.getItem('theme') === 'dream') document.documentElement.dataset.theme = 'dream'
} catch {
  // 浏览器禁用存储时仍正常启动，使用默认主题。
  document.documentElement.dataset.theme = 'light'
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Dialog)

app.mount('#app')
