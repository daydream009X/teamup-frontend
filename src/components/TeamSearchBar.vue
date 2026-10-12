<template>
  <div class="search-wrap">
    <van-search
      :model-value="modelValue"
      placeholder="搜索竞赛队伍，如数学建模、蓝桥杯"
      @update:model-value="$emit('update:modelValue', $event)"
      @search="$emit('search')"
      @clear="$emit('clear')"
    />
    <van-button class="search-btn" type="primary" @click="$emit('search')">搜索</van-button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
  search: []
  clear: []
}>()
</script>

<style scoped>
.search-wrap {
  display: flex;
  align-items: center;
  border: 2px solid var(--input-border);
  border-radius: 8px;
  margin: 8px;
  overflow: hidden;
}
.search-wrap :deep(.van-search) {
  flex: 1;
}
.search-btn {
  flex-shrink: 0;
  margin-right: 8px;
}
</style>
