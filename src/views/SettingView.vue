<template>
  <div id="settingView">
    <van-cell-group inset>
      <van-cell title="主题切换" is-link :value="currentThemeLabel" @click="show = true" />
    </van-cell-group>

    <van-cell-group inset style="margin-top: 16px">
      <van-cell title="关于 TeamUp · 竞赛组队平台" is-link @click="showAbout" />
      <van-cell title="检查更新" is-link @click="showCheckUpdate" />
    </van-cell-group>

    <van-action-sheet
      v-model:show="show"
      :actions="themeActions"
      cancel-text="取消"
      description="选择你喜欢的主题风格"
      close-on-click-action
      @select="onThemeSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { showDialog } from 'vant'

type ThemeValue = 'light' | 'dream'

interface ThemeAction {
  name: string
  value: ThemeValue
}

const themeActions: ThemeAction[] = [
  { name: '白日', value: 'light' },
  { name: '白日做梦', value: 'dream' },
]

const themeLabelMap: Record<ThemeValue, string> = {
  light: '白日',
  dream: '白日做梦',
}

// 读取 localStorage，没有则默认白日
const currentTheme = ref<ThemeValue>((localStorage.getItem('theme') as ThemeValue) || 'light')

const currentThemeLabel = computed(() => themeLabelMap[currentTheme.value])

const applyTheme = (theme: ThemeValue) => {
  currentTheme.value = theme
  document.documentElement.dataset.theme = theme
  localStorage.setItem('theme', theme)
}

const show = ref(false)

const onThemeSelect = (action: ThemeAction) => {
  applyTheme(action.value)
}

// 关于竞赛组队平台
const showAbout = () => {
  showDialog({
    title: '关于 TeamUp · 竞赛组队平台',
    message:
      'TeamUp 是面向数学建模、程序设计、大创等竞赛的移动端组队平台。\n\n按竞赛和技能标签发现队友，寻找需要的技能，共同创建或加入队伍。标签相似匹配可帮助发现标签相近的伙伴。\n\n版本：v0.1.0（测试版）',
  })
}

// 检查更新
const showCheckUpdate = () => {
  showDialog({
    title: '检查更新',
    message: '当前已是最新版本 v0.1.0（测试版），暂无新版本可用。',
  })
}
</script>

<style scoped>
#settingView {
  padding-top: 16px;
}
</style>
