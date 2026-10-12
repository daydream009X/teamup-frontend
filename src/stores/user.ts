import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getCurrentUser } from '@/api/user'
import type { UserType } from '@/models/user.d.ts'

const normalizeUser = (user: UserType): UserType => {
  const userWithRawTags = user as UserType & { tags?: unknown }

  if (typeof userWithRawTags.tags === 'string') {
    try {
      const tags = JSON.parse(userWithRawTags.tags)
      return { ...user, tags: Array.isArray(tags) ? tags : [] }
    } catch {
      return { ...user, tags: [] }
    }
  }

  return { ...user, tags: Array.isArray(userWithRawTags.tags) ? userWithRawTags.tags : [] }
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<UserType | null>(null)
  const loading = ref(false)
  const initialized = ref(false)
  let currentUserRequest: Promise<UserType | null> | null = null
  let currentUserVersion = 0

  const isLogin = computed(() => currentUser.value !== null)

  const invalidateCurrentUserRequest = () => {
    currentUserVersion++
    currentUserRequest = null
    loading.value = false
  }

  const setCurrentUser = (user: UserType) => {
    invalidateCurrentUserRequest()
    currentUser.value = normalizeUser(user)
    initialized.value = true
  }

  const clearCurrentUser = () => {
    invalidateCurrentUserRequest()
    currentUser.value = null
    initialized.value = true
  }

  const fetchCurrentUser = async (force = false) => {
    if (!force && initialized.value) {
      return currentUser.value
    }

    if (currentUserRequest) {
      return currentUserRequest
    }

    loading.value = true
    const requestVersion = currentUserVersion
    const request: Promise<UserType | null> = getCurrentUser()
      .then((user) => {
        if (requestVersion !== currentUserVersion) return currentUser.value
        if (user) {
          setCurrentUser(user)
        } else {
          clearCurrentUser()
        }
        return currentUser.value
      })
      .catch((error: unknown) => {
        if (requestVersion !== currentUserVersion) return currentUser.value
        throw error
      })
      .finally(() => {
        if (currentUserRequest === request) {
          loading.value = false
          currentUserRequest = null
        }
      })
    currentUserRequest = request

    return request
  }

  const refreshCurrentUser = () => fetchCurrentUser(true)

  return {
    currentUser,
    loading,
    initialized,
    isLogin,
    fetchCurrentUser,
    setCurrentUser,
    clearCurrentUser,
    refreshCurrentUser,
  }
})
