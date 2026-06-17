import { UserType } from './user.d.ts'

// 队伍类别
export type TeamType = {
  id: number
  name: string
  description: string
  expireTime?: Date
  maxNum: number
  password?: string
  status: number
  createTime: Date
  updateTime: Date
  createUser?: UserType
  hasJoinNum?: number
  userId?: number
  hasJoin?: boolean
}
