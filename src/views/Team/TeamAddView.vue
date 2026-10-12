<template>
  <div id="teamAddView">
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
          name="expireTime"
          label="过期时间"
          :model-value="addTeamData.expireTime"
          placeholder="点击选择过期时间"
          :rules="[{ required: true, message: '请选择过期时间' }]"
          @click="showPicker = true"
        />
        <van-popup v-model:show="showPicker" position="bottom">
          <van-date-picker
            v-model="currentDate"
            @confirm="onDateConfirm"
            title="请选择过期日期"
            :min-date="minDate"
          />
        </van-popup>
        <van-field name="stepper" label="最大人数">
          <template #input>
            <van-stepper v-model="addTeamData.maxNum" max="10" min="3" />
          </template>
        </van-field>
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
        <van-button round block type="primary" native-type="submit" :loading="submitting">
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { addTeam } from '@/api/team'
import { showToast } from 'vant'

const router = useRouter()
// 展示日期选择器
const showPicker = ref(false)
const currentDate = ref<string[]>([])
const submitting = ref(false)

const initFormData = {
  name: '',
  description: '',
  expireTime: undefined as string | undefined,
  maxNum: 3,
  password: '',
  status: '0',
}

const minDate = new Date()

// 需要用户填写的表单数据
const addTeamData = ref({ ...initFormData })

const onDateConfirm = () => {
  if (currentDate.value.length > 0) {
    addTeamData.value.expireTime = currentDate.value.join('-') + 'T23:59:59'
  }
  showPicker.value = false
}

// 提交
const onSubmit = async () => {
  if (submitting.value) return
  const expireTime = addTeamData.value.expireTime
  if (!expireTime || !(new Date(expireTime).getTime() > Date.now())) {
    showToast('请选择晚于当前时间的过期日期')
    return
  }
  const postData = {
    ...addTeamData.value,
    status: Number(addTeamData.value.status),
  }

  submitting.value = true
  try {
    const res = await addTeam(postData)
    if (res?.code === 0 && res.data) {
      showToast('添加成功')
      await router.push({
        path: '/team',
        replace: true,
      })
    } else {
      showToast(res?.description || res?.message || '添加失败')
    }
  } catch {
    showToast('添加失败，请检查网络后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
#teamAddView {
}
</style>
