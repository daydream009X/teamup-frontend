<template>
  <div id="searchView">
    <!-- 搜索框 -->
    <form action="/">
      <van-search
        v-model="searchText"
        show-action
        placeholder="请输入要搜索的标签"
        @search="onSearch"
        @cancel="onCancel"
      />
    </form>

    <tag-selector ref="tagSelectorRef" v-model="activeIds" />

    <div style="padding: 12px">
      <van-button block type="primary" @click="doSearchResult">搜索</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TagSelector from '@/components/TagSelector.vue'

const router = useRouter()
const tagSelectorRef = ref<InstanceType<typeof TagSelector>>()

const searchText = ref('')

// 搜索过滤
const onSearch = () => {
  tagSelectorRef.value?.filter(searchText.value)
}
const onCancel = () => {
  searchText.value = ''
  tagSelectorRef.value?.filter('')
}

// 已选中的标签
const activeIds = ref<string[]>([])

// 执行搜索
const doSearchResult = () => {
  router.push({
    path: '/user/list',
    query: {
      tags: activeIds.value,
    },
  })
}
</script>

<style scoped>
#searchView {
}
</style>
