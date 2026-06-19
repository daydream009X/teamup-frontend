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
      <van-card
        :desc="user.profile"
        :title="`${user.username}（${user.planetCode}）`"
        :thumb="user.avatarUrl"
      >
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
      :title="contactUser?.username ? `${contactUser.username} 的联系方式` : '联系方式'"
      show-cancel-button
    >
      <div class="contact-content">
        <van-cell title="电话" :value="contactUser?.phone || '未设置'" />
        <van-cell title="邮箱" :value="contactUser?.email || '未设置'" />
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import type { UserType } from '@/models/user.d.ts'
import { ref } from 'vue'

interface UserCardListProps {
  loading: boolean
  userList: UserType[]
}

const props = withDefaults(defineProps<UserCardListProps>(), {
  loading: true,
  userList: () => [],
})

const showDialog = ref(false)
const contactUser = ref<UserType>()

const showContact = (user: UserType) => {
  contactUser.value = user
  showDialog.value = true
}
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
}
</style>
