<template>
  <div id="userCardList">
    <van-skeleton
      title
      avatar
      :row="3"
      :loading="props.loading"
      v-for="user in props.userList"
      :key="user.id"
    >
      <van-card :desc="user.profile" :title="user.username" :thumb="user.avatarUrl">
        <template #tags>
          <van-tag
            plain
            type="danger"
            v-for="tag in user.tags"
            :key="tag"
            style="margin-right: 8px; margin-top: 8px"
          >
            {{ tag }}
          </van-tag>
        </template>
        <template #footer>
          <van-button size="small" type="primary" plain @click="showContact(user)">
            联系方式
          </van-button>
        </template>
      </van-card>
    </van-skeleton>
    <van-dialog
      v-model:show="showDialog"
      :title="contactTarget?.username ? `${contactTarget.username} 的联系方式` : '联系方式'"
      show-cancel-button
    >
      <div class="contact-content">
        <div v-if="contactLoading" class="contact-status" role="status">
          <VanLoading size="24px" vertical>正在加载联系方式</VanLoading>
        </div>
        <div v-else-if="contactError" class="contact-status" role="alert">
          <p>{{ contactError }}</p>
          <van-button size="small" type="primary" plain @click="loadContact">重试</van-button>
        </div>
        <template v-else-if="contactUser">
          <van-cell title="电话" :value="contactUser.phone || '未设置'" />
          <van-cell title="邮箱" :value="contactUser.email || '未设置'" />
          <van-cell title="QQ" :value="contactUser.qq || '未设置'" />
          <van-cell title="微信" :value="contactUser.wechat || '未设置'" />
        </template>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { Loading as VanLoading } from 'vant'
import { getUserContact } from '@/api/user'
import type { UserContactType, UserType } from '@/models/user.d.ts'

interface UserCardListProps {
  loading: boolean
  userList: UserType[]
}

const props = withDefaults(defineProps<UserCardListProps>(), {
  loading: true,
  userList: () => [],
})

const showDialog = ref<boolean>(false)
const contactTarget = ref<Pick<UserType, 'id' | 'username'> | null>(null)
const contactUser = ref<UserContactType | null>(null)
const contactLoading = ref<boolean>(false)
const contactError = ref<string>('')
let contactRequestVersion = 0

const loadContact = async () => {
  const userId = contactTarget.value?.id
  if (userId === undefined || !showDialog.value) return

  const requestVersion = ++contactRequestVersion
  contactUser.value = null
  contactError.value = ''
  contactLoading.value = true

  try {
    const res = await getUserContact(userId)
    if (requestVersion !== contactRequestVersion) return

    if (res.code === 0 && res.data?.id === userId) {
      contactUser.value = res.data
    } else {
      contactError.value =
        res.code === 0
          ? '联系方式数据异常，请重试'
          : res.description || res.message || '联系方式加载失败，请重试'
    }
  } catch {
    if (requestVersion !== contactRequestVersion) return
    contactError.value = '联系方式加载失败，请检查网络后重试'
  } finally {
    if (requestVersion === contactRequestVersion) contactLoading.value = false
  }
}

const showContact = (user: UserType) => {
  contactTarget.value = { id: user.id, username: user.username }
  showDialog.value = true
  void loadContact()
}

watch(
  showDialog,
  (visible) => {
    if (visible) return
    contactRequestVersion++
    contactTarget.value = null
    contactUser.value = null
    contactLoading.value = false
    contactError.value = ''
  },
  { flush: 'sync' },
)

onBeforeUnmount(() => {
  contactRequestVersion++
})
</script>

<style scoped>
#userCardList {
  padding: 0 12px;
}
#userCardList :deep(.van-skeleton) {
  margin-bottom: 12px;
}
#userCardList :deep(.van-card) {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
  transition: box-shadow 0.3s;
}
#userCardList :deep(.van-card):hover {
  box-shadow: var(--card-hover-shadow);
}
#userCardList :deep(.van-card__thumb) {
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
#userCardList :deep(.van-tag) {
  color: #87ceeb !important;
  border-color: #87ceeb !important;
  background: transparent !important;
  font-size: 14px;
  font-weight: bold;
}
.contact-content {
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}
.contact-status {
  padding: 16px 0;
  text-align: center;
}
</style>
