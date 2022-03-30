import { createApp } from 'vue'
import App from './App.vue'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

const myapp = createApp(App)
myapp.use(Antd)
myapp.mount('#app')