<template>
  <div id="userCardList">
    <van-card
      v-for="user in userList"
      :key="user.id"
      :desc="user.profile"
      :title="user.username"
      :thumb="user.avatarUrl"
    >
      <template #tags>
        <van-tag
          v-for="tag in user.tags"
          :key="tag"
          style="margin-right: 8px; margin-top: 5px"
          type="primary"
          plain
        >
          {{ tag }}
        </van-tag>
      </template>
    </van-card>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  userList: any[]
}>()
</script>

<style scoped>
#userCardList {
  padding: 16px;
}
</style>
