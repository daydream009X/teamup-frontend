import { createRouter, createWebHistory } from 'vue-router'
//主页部分
import HomeView from '@/views/HomeView.vue'
//队伍部分
import TeamView from '@/views/Team/TeamView.vue'
import TeamAddView from '@/views/Team/TeamAddView.vue'
import TeamUpdateView from '@/views/Team/TeamUpdateView.vue'

//个人部分
import UserView from '@/views/User/UserView.vue'
import UserEditView from '@/views/User/UserEditView.vue'
import UserLoginView from '@/views/User/UserLoginView.vue'
import UserRegisterView from '@/views/User/UserRegisterView.vue'
import UserUpdateView from '@/views/User/UserUpdateView.vue'
import UserTeamCreateView from '@/views/User/UserTeamCreateView.vue'
import UserTeamJoinView from '@/views/User/UserTeamJoinView.vue'
//设置部分
import SettingView from '@/views/SettingView.vue'
//搜索部分
import SearchView from '@/views/Search/SearchView.vue'
import SearchResultView from '@/views/Search/SearchResultView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    //主页部分
    { path: '/', meta: { title: '主页' }, component: HomeView },
    //队伍部分
    { path: '/team', meta: { title: '队伍页面' }, component: TeamView },
    { path: '/team/add', meta: { title: '添加队伍' }, component: TeamAddView },
    { path: '/team/update', meta: { title: '更新队伍' }, component: TeamUpdateView },
    //个人部分
    { path: '/user', meta: { title: '用户页面' }, component: UserView },
    { path: '/user/edit', meta: { title: '编辑用户' }, component: UserEditView },
    { path: '/user/login', meta: { title: '用户登录' }, component: UserLoginView },
    { path: '/user/register', meta: { title: '用户注册' }, component: UserRegisterView },
    { path: '/user/update', meta: { title: '更新用户' }, component: UserUpdateView },
    { path: '/user/team/create', meta: { title: '创建队伍' }, component: UserTeamCreateView },
    { path: '/user/team/join', meta: { title: '加入队伍' }, component: UserTeamJoinView },
    //设置部分
    { path: '/setting', meta: { title: '设置页面' }, component: SettingView },
    //搜索部分
    { path: '/search', meta: { title: '搜索页面' }, component: SearchView },
    { path: '/user/list', meta: { title: '用户列表' }, component: SearchResultView },
  ],
})

export default router
