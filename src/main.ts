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
const savedTheme = localStorage.getItem('theme') || 'light'
document.documentElement.dataset.theme = savedTheme

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Dialog)

app.mount('#app')
