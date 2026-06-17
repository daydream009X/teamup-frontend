<template>
  <div id="userEditView">
    <van-form @submit="onSubmit">
      <van-field
        v-model="editUser.currentValue"
        :name="editUser.editKey"
        :label="editUser.editName"
        :placeholder="`请输入${editUser.editName}`"
      />
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit"> 提交 </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import myAxios from '@/plugins/myAxios'
import { showToast } from 'vant'
import { getCurrentUser } from '@/services/user.ts'

const route = useRoute()
const router = useRouter()

const editUser = ref({
  editKey: (route.query.editKey as string) ?? '',
  currentValue: (route.query.currentValue as string) ?? '',
  editName: (route.query.editName as string) ?? '',
})

const onSubmit = async () => {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    showToast('用户未登录')
    return
  }

  console.log(currentUser, '当前用户')

  const res = await myAxios.post('/user/update', {
    id: currentUser.id,
    [editUser.value.editKey as string]: editUser.value.currentValue,
  })
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
</style>
