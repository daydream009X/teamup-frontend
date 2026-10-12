<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { showToast } from 'vant'

import { listTags } from '@/api/tag'
import { COMPETITION_TAGS } from '@/constants/hotTags'

interface TagGroup {
  text: string
  id: number | string
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
const filterKeyword = ref<string>('')
const selectedTags = ref<string[]>([...props.modelValue])
const activeIndex = ref<number>(0)
let active = true

const LOCKED = new Set(props.lockedTags)

const lockedTagList = computed(() => selectedTags.value.filter((t) => LOCKED.has(t)))
const normalTagList = computed(() => selectedTags.value.filter((t) => !LOCKED.has(t)))
const allTags = computed(() => selectedTags.value)
const tagGroups = computed<TagGroup[]>(() => {
  const competitionTags = [
    ...new Set([
      ...COMPETITION_TAGS,
      ...originTagList.value
        .filter((group) => group.text === '竞赛类别')
        .flatMap((group) => group.children.map((tag) => tag.id)),
    ]),
  ]
  return [
    {
      text: '竞赛类别',
      id: 'competition',
      children: competitionTags.map((tag) => ({ text: tag, id: tag })),
    },
    ...originTagList.value.filter((group) => group.text !== '竞赛类别'),
  ]
})
const displayTagList = computed(() => {
  if (!filterKeyword.value) {
    return tagGroups.value
  }
  return tagGroups.value.map((parentTag) => ({
    ...parentTag,
    children: parentTag.children.filter((item) => item.text.includes(filterKeyword.value)),
  }))
})

const doClose = (tag: string) => {
  selectedTags.value = selectedTags.value.filter((t) => t !== tag)
  emit('update:modelValue', [...selectedTags.value])
}

const onActiveIdChange = (ids: string[]) => {
  selectedTags.value = ids
  emit('update:modelValue', [...ids])
}

const fetchTags = async () => {
  try {
    const res = await listTags()
    if (!active) return
    if (res?.code !== 0) {
      showToast('标签加载失败，请稍后重试')
      return
    }
    const data: unknown = res.data
    if (!Array.isArray(data)) {
      showToast('标签数据异常，请稍后重试')
      return
    }
    const validTags = data.filter(
      (tag: unknown): tag is Record<string, unknown> & { tagName: string } =>
        typeof tag === 'object' &&
        tag !== null &&
        'tagName' in tag &&
        typeof tag.tagName === 'string' &&
        tag.tagName.trim().length > 0,
    )
    const parents = validTags.filter((tag) => tag.isParent === 1 || tag.isParent === true)
    const children = validTags.filter((tag) => !(tag.isParent === 1 || tag.isParent === true))
    let filteredParents = parents
    if (props.excludeGenderGroup) {
      filteredParents = parents.filter((parentTag) => parentTag.tagName !== '性别')
    }
    const mapped = filteredParents.map((parentTag) => ({
      text: parentTag.tagName,
      id: parentTag.id as number,
      children: children
        .filter((childTag) => childTag.parentId === parentTag.id)
        .map((childTag) => ({
          text: childTag.tagName,
          id: childTag.tagName,
        })),
    }))
    originTagList.value = mapped
  } catch {
    if (!active) return
    showToast('标签加载失败，请检查网络后重试')
  }
}

const filter = (keyword: string): void => {
  filterKeyword.value = keyword
}

defineExpose({ filter })

onMounted(() => {
  void fetchTags()
})

onUnmounted(() => {
  active = false
})

watch(displayTagList, (groups) => {
  if (groups[activeIndex.value]?.children.length) return
  const firstMatch = groups.findIndex((group) => group.children.length > 0)
  activeIndex.value = Math.max(firstMatch, 0)
})

// 监听外部 v-model 变化，同步到内部
watch(
  () => props.modelValue,
  (val) => {
    selectedTags.value = [...val]
  },
)
</script>

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
