<template>
  <div id="userEditView">
    <!-- 头像选择模式 -->
    <template v-if="editUser.editKey === 'avatarUrl'">
      <div class="avatar-edit">
        <van-divider
          :style="{
            color: 'var(--color-primary)',
            borderColor: 'var(--color-primary)',
            padding: '0 16px',
          }"
        >
          当前头像
        </van-divider>
        <div class="current-avatar">
          <img :src="editUser.currentValue" alt="当前头像" />
        </div>

        <van-divider
          :style="{
            color: 'var(--color-primary)',
            borderColor: 'var(--color-primary)',
            padding: '0 16px',
          }"
        >
          选择新头像
        </van-divider>
        <div class="avatar-grid">
          <div
            v-for="avatar in avatarList"
            :key="avatar"
            class="avatar-item"
            :class="{ selected: editUser.currentValue === avatar }"
            @click="editUser.currentValue = avatar"
          >
            <img :src="avatar" alt="头像" />
          </div>
        </div>

        <div style="margin: 16px">
          <van-button round block type="primary" @click="onSubmit">提交</van-button>
        </div>
      </div>
    </template>

    <!-- 普通编辑模式 -->
    <template v-else-if="editUser.editKey !== 'tags'">
      <van-form @submit="onSubmit">
        <!-- 性别：单选框 -->
        <van-field v-if="editUser.editKey === 'gender'" name="gender" label="性别">
          <template #input>
            <van-radio-group v-model="editUser.currentValue" direction="horizontal">
              <van-radio name="1">男</van-radio>
              <van-radio name="0">女</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <!-- 其他字段：文本输入 -->
        <van-field
          v-else
          v-model="editUser.currentValue"
          :name="editUser.editKey"
          :label="editUser.editName"
          :placeholder="`请输入${editUser.editName}`"
        />
        <div style="margin: 16px">
          <van-button round block type="primary" native-type="submit"> 提交 </van-button>
        </div>
      </van-form>
    </template>

    <!-- 标签编辑模式 -->
    <template v-else>
      <van-form @submit="onSubmitTags">
        <tag-selector
          v-model="selectedTags"
          :locked-tags="['男', '女']"
          :exclude-gender-group="true"
        />
        <div style="margin: 16px">
          <van-button round block type="primary" native-type="submit"> 提交 </van-button>
        </div>
      </van-form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import { getCurrentUser, updateUser } from '@/api/user'
import AVATARS from '@/constants/avatars'
import TagSelector from '@/components/TagSelector.vue'

const route = useRoute()
const router = useRouter()

const avatarList = ref(AVATARS)

const editUser = ref({
  editKey: (route.query.editKey as string) ?? '',
  currentValue: (route.query.currentValue as string) ?? '',
  editName: (route.query.editName as string) ?? '',
})

const selectedTags = ref<string[]>([])

const onSubmitTags = async () => {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    showToast('用户未登录')
    return
  }
  const res = await updateUser({
    id: currentUser.id,
    tags: JSON.stringify(selectedTags.value),
  })
  if (res?.code === 0 && res.data) {
    showToast('标签修改成功')
    router.back()
  } else {
    showToast('标签修改失败')
  }
}

// 进入标签模式时加载已有标签
onMounted(async () => {
  if (editUser.value.editKey === 'tags') {
    try {
      selectedTags.value = JSON.parse(editUser.value.currentValue)
    } catch {
      selectedTags.value = []
    }
  }
})
// ---- 标签编辑相关 end ----

const onSubmit = async () => {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    showToast('用户未登录')
    return
  }

  console.log(currentUser, '当前用户')

  const updateData: Record<string, unknown> = {
    id: currentUser.id,
    [editUser.value.editKey as string]:
      editUser.value.editKey === 'gender'
        ? Number(editUser.value.currentValue)
        : editUser.value.currentValue,
  }

  // 修改性别时，同步更新 tags 中的性别标签
  if (editUser.value.editKey === 'gender') {
    let tags: string[] = []
    if (currentUser.tags) {
      if (typeof currentUser.tags === 'string') {
        try {
          tags = JSON.parse(currentUser.tags)
        } catch {
          tags = []
        }
      } else if (Array.isArray(currentUser.tags)) {
        tags = currentUser.tags
      }
    }
    const GENDER_TAGS = ['男', '女']
    tags = tags.filter((t: string) => !GENDER_TAGS.includes(t))
    const newGender = Number(editUser.value.currentValue) === 1 ? '男' : '女'
    tags.unshift(newGender)
    updateData.tags = JSON.stringify(tags)
  }

  const res = await updateUser(updateData)
  console.log(res, '更新请求')
  if (res.code === 0 && res.data) {
    showToast('修改成功')
    router.back()
  } else {
    showToast('修改错误')
  }
}
</script>

<style scoped>
#userEditView {
}
.current-avatar {
  display: flex;
  justify-content: center;
  padding: 16px;
}
.current-avatar img {
  width: 80px;
  height: 80px;
  border: 3px solid var(--color-primary);
}
.avatar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 0 16px;
}
.avatar-item {
  aspect-ratio: 1;
  border: 3px solid transparent;
  cursor: pointer;
  transition: border-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.avatar-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.avatar-item.selected {
  border-color: var(--color-sky);
}
</style>
