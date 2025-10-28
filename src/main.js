import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import Home from './pages/Home.vue'
import Study from './pages/Study.vue'
import Vocabulary from './pages/Vocabulary.vue'
import Settings from './pages/Settings.vue'

import './styles/global.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/study/:chapterId', component: Study },
    { path: '/vocabulary', component: Vocabulary },
    { path: '/settings', component: Settings }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
