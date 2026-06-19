<template>
  <div id="userLoginView">
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="userAccount"
          name="userAccount"
          label="账号"
          placeholder="请输入账号"
          :formatter="noSpace"
          :rules="[{ required: true, message: '请填写账号' }]"
        />
        <van-field
          v-model="userPassword"
          :type="passwordVisible ? 'text' : 'password'"
          name="userPassword"
          label="密码"
          placeholder="请输入密码"
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
      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit"> 登录 </van-button>
      </div>
      <div class="to-register">
        还没有账户吗？<router-link to="/user/register">我们现在就去注册！</router-link>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { login } from '@/api/user'
import { showToast } from 'vant'

const route = useRoute()

const userAccount = ref('')
const userPassword = ref('')
const passwordVisible = ref(false)

// 去除空格
const noSpace = (val: string) => val.replace(/\s/g, '')
const noSpaceValidator = (val: string) => !/\s/.test(val)

const onSubmit = async () => {
  const res = await login({
    userAccount: userAccount.value,
    userPassword: userPassword.value,
  })
  console.log(res, '用户登录')
  if (res.code === 0 && res.data) {
    showToast('登录成功')
    // 跳转到之前的页面
    const redirectUrl = (route.query?.redirect as string) ?? '/'
    window.location.href = redirectUrl
  } else {
    showToast('登录失败')
  }
}
</script>

<style scoped>
#userLoginView {
}
.to-register {
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  color: var(--text-muted);
}
.to-register a {
  color: var(--color-primary);
}
</style>
