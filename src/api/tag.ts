import myAxios from '@/plugins/myAxios'

/**
 * 获取标签列表
 */
export const listTags = () => myAxios.get('/tag/list')
