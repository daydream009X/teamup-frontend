import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import TeamView from '@/views/Team/TeamView.vue'
import UserView from '@/views/User/UserView.vue'
import SettingView from '@/views/SettingView.vue'

import SearchView from '@/views/Search/SearchView.vue'
import SearchResultView from '@/views/Search/SearchResultView.vue'

import UserEditView from '@/views/User/UserEditView.vue'
import UserLoginView from '@/views/User/UserLoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    { path: '/team', component: TeamView },
    { path: '/user', component: UserView },
    { path: '/setting', component: SettingView },
    { path: '/search', component: SearchView },
    { path: '/user/edit', component: UserEditView },
    { path: '/user/list', component: SearchResultView },
    { path: '/user/login', component: UserLoginView },
  ],
})

export default router
