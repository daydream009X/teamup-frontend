<template>
  <div id="basicLayout">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      :title="($route.meta.title as string) ?? ''"
      left-arrow
      background="var(--nav-bar-bg)"
      text-light
      @click-left="onClickLeft"
      @click-right="onClickRight"
    >
      <template #right>
        <van-icon name="search" size="24px" />
      </template>
    </van-nav-bar>

    <!-- 内容栏 -->
    <div id="content">
      <router-view />
    </div>

    <!-- 底部导航栏 -->
    <van-tabbar route>
      <van-tabbar-item to="/" icon="home-o">主页</van-tabbar-item>
      <van-tabbar-item to="/team" icon="friends-o">队伍</van-tabbar-item>
      <van-tabbar-item to="/user" icon="user-o">个人</van-tabbar-item>
      <van-tabbar-item to="/setting" icon="setting-o">设置</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const onClickLeft = () => history.back()
const onClickRight = () => {
  router.push('/search')
}
</script>

<style scoped>
#basicLayout {
}
#content {
  padding-bottom: 70px;
}
</style>
