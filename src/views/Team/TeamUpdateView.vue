<template>
  <div id="teamUpdateView">
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="addTeamData.name"
          name="name"
          label="队伍名"
          placeholder="请输入队伍名"
          :rules="[{ required: true, message: '请输入队伍名' }]"
        />
        <van-field
          v-model="addTeamData.description"
          rows="4"
          autosize
          label="队伍描述"
          type="textarea"
          placeholder="请输入队伍描述"
        />
        <van-field
          is-link
          readonly
          name="datetimePicker"
          label="过期时间"
          :placeholder="addTeamData.expireTime ?? '点击选择过期时间'"
          @click="showPicker = true"
        />
        <van-popup v-model:show="showPicker" position="bottom">
          <van-date-picker
            v-model="currentDate"
            @confirm="onDateConfirm"
            title="请选择过期日期"
            :min="minDate"
          />
        </van-popup>
        <van-field name="radio" label="队伍状态">
          <template #input>
            <van-radio-group v-model="addTeamData.status" direction="horizontal">
              <van-radio name="0">公开</van-radio>
              <van-radio name="1">私有</van-radio>
              <van-radio name="2">加密</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field
          v-if="Number(addTeamData.status) === 2"
          v-model="addTeamData.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入队伍密码"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit"> 提交 </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import myAxios from '@/plugins/myAxios'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()

interface TeamData {
  name?: string
  description?: string
  expireTime?: string
  status?: string | number
  password?: string
  [key: string]: unknown
}

// 展示日期选择器
const showPicker = ref(false)
const currentDate = ref<string[]>([])

const minDate = new Date()

const id = route.query.id

// 需要用户填写的表单数据
const addTeamData = ref<TeamData>({})

const onDateConfirm = () => {
  if (currentDate.value.length > 0) {
    addTeamData.value.expireTime = currentDate.value.join('-') + 'T23:59:59'
  }
  showPicker.value = false
}

// 获取之前的队伍信息
onMounted(async () => {
  if (!id || Number(id) <= 0) {
    showToast('加载队伍失败')
    return
  }
  const res = await myAxios.get('/team/get', {
    params: {
      id,
    },
  })
  if (res?.code === 0) {
    addTeamData.value = res.data as Record<string, unknown>
  } else {
    showToast('加载队伍失败，请刷新重试')
  }
})

// 提交
const onSubmit = async () => {
  const postData = {
    ...addTeamData.value,
    status: Number(addTeamData.value.status),
  }
  // todo 前端参数校验
  const res = await myAxios.post('/team/update', postData)
  if (res?.code === 0 && res.data) {
    showToast('更新成功')
    router.push({
      path: '/team',
      replace: true,
    })
  } else {
    showToast('更新失败')
  }
}
</script>

<style scoped>
#teamUpdateView {
}
</style>
