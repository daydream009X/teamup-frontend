import { ref } from 'vue'
import type { UserType } from '@/models/user.d.ts'

const currentUser = ref<UserType | null>(null)

const setCurrentUserState = (user: UserType) => {
  currentUser.value = user
}

const getCurrentUserState = (): UserType | null => {
  return currentUser.value
}

export const useUserStore = () => {
  return { currentUser, setCurrentUserState, getCurrentUserState }
}
