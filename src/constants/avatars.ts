/**
 * 中性本地头像，使用部署基础路径，保证保存到用户资料后的地址稳定。
 */
const AVATARS: string[] = [
  `${import.meta.env.BASE_URL}avatars/avatar-blue.svg`,
  `${import.meta.env.BASE_URL}avatars/avatar-teal.svg`,
  `${import.meta.env.BASE_URL}avatars/avatar-purple.svg`,
  `${import.meta.env.BASE_URL}avatars/avatar-amber.svg`,
  `${import.meta.env.BASE_URL}avatars/avatar-rose.svg`,
  `${import.meta.env.BASE_URL}avatars/avatar-slate.svg`,
  `${import.meta.env.BASE_URL}avatars/avatar-green.svg`,
]

export default AVATARS
