# 小梦伙伴匹配系统 - 前端

基于 Vue 3 + TypeScript + Vant 4 构建的移动端伙伴匹配 SPA（单页应用），提供用户匹配推荐、标签搜索、队伍创建/加入等社交匹配功能。

## 技术栈

| 类别      | 技术                                       |
| --------- | ------------------------------------------ |
| 框架      | Vue 3 (Composition API + `<script setup>`) |
| 语言      | TypeScript                                 |
| 构建      | Vite                                       |
| UI 组件库 | Vant 4                                     |
| 路由      | Vue Router 5                               |
| HTTP 请求 | Axios                                      |
| 状态管理  | Pinia                                      |
| 代码规范  | ESLint + Prettier + Oxlint                 |

## 项目结构

```
src/
├── api/                # API 接口封装（按模块拆分）
│   ├── user.ts         # 用户相关：登录/注册/登出/匹配/推荐/搜索
│   ├── team.ts         # 队伍相关：CRUD/加入/退出/解散
│   └── tag.ts          # 标签相关：标签列表
├── assets/             # 静态资源（图片、CSS）
├── components/         # 公共组件
│   ├── TeamCardList.vue    # 队伍卡片列表
│   ├── TeamSearchBar.vue   # 队伍搜索栏
│   ├── TagSelector.vue     # 标签多选选择器
│   └── UserCardList.vue    # 用户卡片列表
├── constants/          # 静态常量
│   ├── avatars.ts      # 可选头像列表
│   └── teamStatus.ts   # 队伍状态枚举
├── layouts/            # 布局组件
├── models/             # TypeScript 类型定义
├── plugins/            # 插件基础设施
│   └── myAxios.ts      # Axios 实例封装（拦截器、baseURL）
├── router/             # 路由配置
├── stores/             # Pinia 状态管理
├── utils/              # 工具函数
│   └── dateUtils.ts    # 日期格式化
└── views/              # 页面视图
    ├── HomeView.vue        # 首页（匹配/推荐双模式）
    ├── SettingView.vue     # 设置页
    ├── Search/             # 搜索模块
    ├── Team/               # 队伍模块（列表/创建/编辑）
    └── User/               # 用户模块（登录/注册/资料/队伍）
```

## 功能概览

### 用户模块

- 用户注册 / 登录 / 登出
- 个人资料查看与编辑（昵称、头像、性别、电话、邮箱、标签）
- 极速匹配（按标签匹配其他用户）
- 普通推荐（分页查询用户列表）
- 按标签搜索用户

### 队伍模块

- 创建队伍（公开/私有/加密三种状态）
- 队伍列表（公开/加密 Tab 切换 + 关键词搜索）
- 加入 / 退出 / 解散队伍
- 队伍详情编辑
- 我创建的队伍 / 我加入的队伍

### 其他

- 标签多选组件（支持分类筛选、锁定标签）
- 队伍搜索栏
- 日期格式化工具

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm / npm / yarn

### 安装与运行

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### API 配置

开发环境 API 基地址为 `http://localhost:8080/api`，生产环境需在 `src/plugins/myAxios.ts` 中配置线上地址。

## 页面路由

| 路径                | 页面                  |
| ------------------- | --------------------- |
| `/`                 | 主页（用户匹配/推荐） |
| `/search`           | 标签搜索              |
| `/user/list`        | 搜索结果列表          |
| `/team`             | 队伍列表              |
| `/team/add`         | 创建队伍              |
| `/team/update`      | 编辑队伍              |
| `/user`             | 个人中心              |
| `/user/login`       | 登录                  |
| `/user/register`    | 注册                  |
| `/user/update`      | 修改资料              |
| `/user/edit`        | 编辑单个字段          |
| `/user/team/create` | 我创建的队伍          |
| `/user/team/join`   | 我加入的队伍          |
| `/setting`          | 设置                  |

## License

MIT
