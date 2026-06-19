<template>
  <div class="tag-selector">
    <van-divider
      :style="{
        color: 'var(--color-primary)',
        borderColor: 'var(--color-primary)',
        padding: '0 16px',
      }"
    >
      已选标签
    </van-divider>
    <div v-if="allTags.length === 0" style="padding: 0 16px">请选择标签</div>
    <div class="tag-grid">
      <van-tag v-for="tag in lockedTagList" :key="tag" type="primary">{{ tag }}</van-tag>
      <van-tag
        v-for="tag in normalTagList"
        :key="tag"
        closeable
        type="primary"
        @close="doClose(tag)"
      >
        {{ tag }}
      </van-tag>
    </div>

    <van-divider
      :style="{
        color: 'var(--color-primary)',
        borderColor: 'var(--color-primary)',
        padding: '0 16px',
      }"
    >
      选择标签
    </van-divider>
    <van-tree-select
      :active-id="selectedTags"
      :main-active-index="activeIndex"
      :items="displayTagList"
      @update:active-id="onActiveIdChange"
      @update:main-active-index="activeIndex = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { listTags } from '@/api/tag'

interface TagGroup {
  text: string
  id: number
  children: { text: string; id: string }[]
}

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    lockedTags?: string[]
    excludeGenderGroup?: boolean
  }>(),
  {
    lockedTags: () => [],
    excludeGenderGroup: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const originTagList = ref<TagGroup[]>([])
const displayTagList = ref<TagGroup[]>([])
const selectedTags = ref<string[]>([...props.modelValue])
const activeIndex = ref(0)

const LOCKED = new Set(props.lockedTags)

const lockedTagList = computed(() => selectedTags.value.filter((t) => LOCKED.has(t)))
const normalTagList = computed(() => selectedTags.value.filter((t) => !LOCKED.has(t)))
const allTags = computed(() => selectedTags.value)

const doClose = (tag: string) => {
  selectedTags.value = selectedTags.value.filter((t) => t !== tag)
  emit('update:modelValue', [...selectedTags.value])
}

const onActiveIdChange = (ids: string[]) => {
  selectedTags.value = ids
  emit('update:modelValue', [...ids])
}

const fetchTags = async () => {
  const res = await listTags()
  if (res?.code === 0) {
    const data = res.data as unknown as Record<string, unknown>[]
    const parents = data.filter(
      (t: Record<string, unknown>) => t.isParent === 1 || t.isParent === true,
    )
    const children = data.filter(
      (t: Record<string, unknown>) => !(t.isParent === 1 || t.isParent === true),
    )
    let filteredParents = parents
    if (props.excludeGenderGroup) {
      filteredParents = parents.filter((p: Record<string, unknown>) => p.tagName !== '性别')
    }
    const mapped = filteredParents.map((p: Record<string, unknown>) => ({
      text: p.tagName as string,
      id: p.id as number,
      children: children
        .filter((c: Record<string, unknown>) => c.parentId === p.id)
        .map((c: Record<string, unknown>) => ({
          text: c.tagName as string,
          id: c.tagName as string,
        })),
    }))
    originTagList.value = mapped
    displayTagList.value = mapped
  }
}

onMounted(() => {
  fetchTags()
})

// 监听外部 v-model 变化，同步到内部
watch(
  () => props.modelValue,
  (val) => {
    selectedTags.value = [...val]
  },
)

const filter = (keyword: string) => {
  if (!keyword) {
    displayTagList.value = originTagList.value
    return
  }
  displayTagList.value = originTagList.value.map((parentTag) => {
    const tempParentTag = { ...parentTag }
    tempParentTag.children = parentTag.children.filter((item) => item.text.includes(keyword))
    return tempParentTag
  })
}

defineExpose({ filter })
</script>

<style scoped>
.tag-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 0 16px;
  justify-items: stretch;
}
.tag-grid :deep(.van-tag) {
  padding: 6px 10px;
  justify-content: center;
  border-radius: 4px;
}
</style>
