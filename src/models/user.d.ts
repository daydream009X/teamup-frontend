// 用户类别
export type UserType = {
  id: number
  username: string
  userAccount: string
  avatarUrl?: string
  profile?: string
  gender: number
  phone: string
  email: string
  qq?: string | null
  wechat?: string | null
  userStatus: number
  userRole: number
  tags: string[]
  createTime: Date
}

export type UserContactType = {
  id: number
  phone?: string | null
  email?: string | null
  qq?: string | null
  wechat?: string | null
}
