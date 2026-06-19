<template>
  <div id="userView">
    <template v-if="user">
      <user-card-list :user-list="[user]" :loading="false" />
      <van-cell title="修改信息" is-link to="/user/update" />
      <van-cell title="我创建的队伍" is-link to="/user/team/create" />
      <van-cell title="我加入的队伍" is-link to="/user/team/join" />

      <div class="logout-wrapper">
        <van-button round block type="primary" @click="doSwitchAccount">切换账户</van-button>
        <van-button round block type="danger" @click="doLogout">退出登录</van-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, logout } from '@/api/user'
import { showToast } from 'vant'
import UserCardList from '@/components/UserCardList.vue'

const user = ref()
const router = useRouter()

onMounted(async () => {
  user.value = await getCurrentUser()
  if (user.value?.tags && typeof user.value.tags === 'string') {
    user.value.tags = JSON.parse(user.value.tags)
  }
})

// 退出登录
const doLogout = async () => {
  const res = await logout()
  if (res?.code === 0) {
    user.value = null
    router.push('/')
    showToast('已退出登录')
  } else {
    showToast('退出失败')
  }
}

// 切换账户
const doSwitchAccount = async () => {
  await logout()
  user.value = null
  router.push('/user/login')
}
</script>

<style scoped>
#userView {
  display: flex;
  flex-direction: column;
  min-height: 80vh;
}
#userView :deep(#userCardList) {
  padding: 0;
}
.logout-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2vh;
  margin-top: auto;
  padding: 20px 16px 40px;
}
</style>
