<template>
  <div id="userRegisterView">
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="userAccount"
          name="userAccount"
          label="账号"
          placeholder="请输入账号（不少于4位）"
          :formatter="noSpace"
          :rules="[{ required: true, message: '请填写账号' }]"
        />
        <van-field
          v-model="userPassword"
          :type="passwordVisible ? 'text' : 'password'"
          name="userPassword"
          label="密码"
          placeholder="请输入密码（不少于8位）"
          :rules="[
            { required: true, message: '请填写密码' },
            { validator: noSpaceValidator, message: '密码不能包含空格' },
          ]"
        >
          <template #right-icon>
            <van-icon
              :name="passwordVisible ? 'eye-o' : 'closed-eye'"
              @click="passwordVisible = !passwordVisible"
            />
          </template>
        </van-field>
        <van-field
          v-model="checkPassword"
          :type="checkPasswordVisible ? 'text' : 'password'"
          name="checkPassword"
          label="确认密码"
          placeholder="请再次输入密码"
          :rules="[
            { required: true, message: '请确认密码' },
            { validator: checkPasswordValidator, message: '两次输入密码不一致' },
          ]"
        >
          <template #right-icon>
            <van-icon
              :name="checkPasswordVisible ? 'eye-o' : 'closed-eye'"
              @click="checkPasswordVisible = !checkPasswordVisible"
            />
          </template>
        </van-field>
        <van-field
          v-model="planetCode"
          name="planetCode"
          label="成员编号"
          placeholder="请输入成员编号（不超过5位）"
          :formatter="noSpace"
          :rules="[{ required: true, message: '请填写成员编号' }]"
        />
      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="submitting">
          注册
        </van-button>
      </div>
    </van-form>
    <div class="to-login">
      已有账户？
      <router-link to="/user/login">点此登录</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/api/user'
import { showToast } from 'vant'

const router = useRouter()

const userAccount = ref('')
const userPassword = ref('')
const checkPassword = ref('')
const planetCode = ref('')
const passwordVisible = ref(false)
const checkPasswordVisible = ref(false)
const submitting = ref(false)

// 去除空格
const noSpace = (val: string) => val.replace(/\s/g, '')
const noSpaceValidator = (val: string) => !/\s/.test(val)

const checkPasswordValidator = (val: string) => val === userPassword.value

const onSubmit = async () => {
  if (submitting.value) return
  submitting.value = true
  try {
    const randomSuffix = Math.floor(Math.random() * 9000000) + 1000000
    const defaultUsername = '用户' + randomSuffix
    const res = await register({
      userAccount: userAccount.value,
      userPassword: userPassword.value,
      checkPassword: checkPassword.value,
      planetCode: planetCode.value,
      username: defaultUsername,
    })
    const userId = Number(res?.data)
    if (res?.code === 0 && Number.isSafeInteger(userId) && userId > 0) {
      showToast('注册成功')
      await router.push('/user/login')
    } else {
      showToast(
        res?.description || (res?.code !== 0 && res?.message) || '注册失败，请检查账号和密码',
      )
    }
  } catch {
    showToast('注册请求失败，请检查网络后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
#userRegisterView {
}
.to-login {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: var(--text-muted);
}
.to-login a {
  color: var(--color-primary);
}
</style>
