# TeamUp · 竞赛组队平台

## 1. 项目背景

TeamUp 是面向数学建模、程序设计、大创等竞赛的移动端组队平台，帮助参赛者按竞赛方向和技能标签发现队友。用户可以搜索所需技能、查看候选队友，并创建或加入队伍，逐步补齐团队分工。本仓库为 Vue 3 前端，配套后端使用 Spring Boot。

## 2. 在线演示与测试账号

- 在线演示地址：**待补充**。
- 公开测试账号及密码：**待补充**；确认可公开后再填写，请勿使用真实个人账号或本地配置中的账号。
- 截图占位：待补充以下页面的实际截图。

| 页面                         | 截图   |
| ---------------------------- | ------ |
| 首页与标签相似匹配           | 待补充 |
| 标签搜索、搜索历史与热门标签 | 待补充 |
| 竞赛队伍列表                 | 待补充 |
| 个人中心与技能标签编辑       | 待补充 |

热门标签使用静态竞赛场景配置。数据库中的演示用户、技能标签和队伍需要由维护者另行整理；现有数据不一定包含这些标签，搜索返回空结果属于正常情况。

## 3. 技术架构

```text
移动端浏览器
  └─ Vue 3 + TypeScript + Vant 4
       ├─ Vue Router：页面路由与登录守卫
       ├─ Pinia：当前用户与共享登录态请求
       ├─ localStorage：搜索历史
       └─ Axios + qs：接口请求与数组参数序列化
            └─ Nginx：静态资源托管与同域 API 反向代理
                 └─ Spring Boot + MyBatis-Plus
                      ├─ MySQL：用户、标签、队伍与成员关系
                      └─ Redis：Session、推荐缓存与 Redisson 分布式锁
```

前端使用 Vite 构建，现有部署基础路径为 `/xiaomeng-partner-match/`，生产 API 基地址为 `/partner-match-api`。品牌更名为 TeamUp 后仍保留这两个路径，以兼容现有部署；仓库目录名和后端协议字段也不因界面更名而改变。

开发 API 基地址为 `http://localhost:8081/api`，配置见 `src/plugins/myAxios.ts`。Axios 携带 Cookie，登录态由服务端 Session 维护；前端 Store 共享当前用户请求，并区分未登录与网络异常。

## 4. 功能清单

- **账号与资料**：注册、登录、退出，编辑昵称、头像、性别、联系方式及标签；可选头像使用中性本地 SVG。
- **队友发现**：首页推荐与标签相似匹配。后端匹配使用标签序列的编辑距离寻找相似用户；推荐接口优先使用缓存，无缓存时有标签走相似匹配，无标签走分页查询。寻找技能互补队友由用户通过所需技能标签搜索完成。
- **标签搜索**：按竞赛或技能标签查找用户，支持多标签组合；后端按完整标签名判断，多个标签必须同时满足（AND），英文标签区分大小写。
- **搜索历史**：搜索成功后在本地保存关键词（空结果也属于成功），重复项移至最前，最多保留 10 条；多标签查询按各标签分别记录，点击历史项重新搜索该单个标签。支持单条删除与一键清空。数据使用 `teamup_search_history` 保存，仅属于当前浏览器。
- **热门标签**：数学建模、ACM、蓝桥杯、大创、前端、算法、UI设计、文案策划，共 8 个静态标签；点击即可搜索，并非实时热度排行。
- **队伍协作**：创建与编辑公开、私有、加密队伍，加入、退出、解散队伍；查看我创建或加入的队伍。队伍列表支持公开/加密分类与关键词搜索，可由游客访问。
- **移动端体验**：复用 Vant 组件、标签样式和现有主题，支持子路径部署及登录后站内回跳。

## 5. 踩坑与解决

以下记录来自项目真实联调经历，侧重前端请求、浏览器行为与后端返回的联合定位；当前代码的处理范围和遗留问题分别注明。

### Cookie Path 导致登录态丢失

联调中曾出现登录请求成功、后续接口仍提示未登录的问题。排查时同时检查登录响应的 `Set-Cookie`、浏览器中的 Cookie Path，以及后续请求是否携带 Cookie：反向代理改变了外部 API 路径，而 Cookie 仍限定在后端路径时，浏览器不会向外部 API 路径发送它。

处理方向是在 Nginx 中让 Cookie Path 与浏览器实际访问的 API 路径一致，并保留 Axios 的 `withCredentials`。下面仅是与本项目路径相符的**配置参考，不代表当前服务器的实机配置，也未经本次改造部署验证**；应以实际 `Set-Cookie` 和目录布局为准。

```nginx
# 假设后端返回 Path=/api，外部 API 前缀为 /partner-match-api/
location /partner-match-api/ {
    proxy_pass http://127.0.0.1:8081/api/;
    proxy_cookie_path /api /partner-match-api;
}

# 假设 dist 已放在站点根目录对应的 xiaomeng-partner-match 子目录
location /xiaomeng-partner-match/ {
    try_files $uri $uri/ /xiaomeng-partner-match/index.html;
}
```

### 同域多个项目的子路径共存

多个前端共用域名时，只改路由前缀不够：静态资源地址、Vue Router 的 history base、页面刷新回退地址和 API 代理前缀也需要对应。项目使用 Vite 的 `base` 和 `createWebHistory(import.meta.env.BASE_URL)` 保持一致，登录回跳使用站内路径，避免丢失子目录或跳到外站。

本次更名保留现有部署路径；新增可选头像也使用 `BASE_URL` 拼接固定资源地址。多个后端共用同域 Session Cookie 时，还需核对 Cookie 的名称、Path 和服务端 Session 隔离，避免其他项目的登录态互相覆盖。

### qs 数组参数与 Spring Boot 绑定

标签搜索使用 `List<String> tagNameList` 接收多个标签。联调时对照浏览器请求参数与后端绑定结果，将数组序列化为重复同名参数，而非带下标或方括号的键。

`src/api/user.ts` 复用 qs 的 `indices: false`：

```ts
paramsSerializer: (params: Record<string, unknown>) => qs.stringify(params, { indices: false })
```

例如两个标签在解码后的查询参数中表示为 `tagNameList=算法&tagNameList=前端`，发送时中文由 qs 进行 URL 编码。单标签与多标签复用同一搜索接口。

### 并发建队超限与 MyBatis 空集合 SQL

这两类问题需要结合重复请求、响应业务码、后端日志及数据库记录定位，不能仅靠前端禁用按钮判断根因。建队上限属于后端业务约束，“先查询数量再插入”在并发下可能被多个请求同时通过；空集合传入 `IN` 查询则可能生成异常 SQL。

当前后端建队已有按用户加锁与锁内数量校验，部分队伍查询也在空集合时提前返回或跳过 `IN`。但静态检查仍发现：建队锁在方法 `finally` 中释放，先于 Spring 事务提交；`matchUsers` 的候选用户 ID 为空时仍可能执行 `IN` 查询。因此这些属于已定位、部分路径已有处理的联调记录，不能宣称并发与空集合问题已全面修复。本次改造仅修改前端，后端整改与真实服务的并发回归需单独安排。

## 6. 本地运行

### 环境要求

- Node.js：`^20.19.0 || >=22.12.0`，与 `package.json` 的 `engines` 一致。
- 包管理器：npm 或 pnpm；仓库现有 `package-lock.json` 可用于 npm 的锁定安装。
- 联调时需要另行启动配套 Spring Boot 服务，以及它依赖的 MySQL、Redis。前端开发服务器本身不会自动启动后端，也不提供模拟账号。

进入前端目录后执行：

```bash
# 使用已有 npm 锁文件安装
npm ci

# 启动开发服务器
npm run dev

# 类型检查与生产构建，产物位于 dist/
npm run build

# 本地预览生产构建
npm run preview
```

也可使用任务书中的 pnpm 命令：

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

开发页面路径为开发服务器地址下的 `/xiaomeng-partner-match/`。生产预览仍使用 `/partner-match-api`，需要对应的反向代理才能联调 API；Vite 的 `preview` 仅提供静态资源。

Windows PowerShell 若拦截 `npm.ps1`，可改用 `npm.cmd ci`、`npm.cmd run dev`、`npm.cmd run build`。质量检查可运行 `npm run type-check` 和 `npm run lint`；后者带自动修复，检查前应保留工作区状态。

搜索历史回归检查使用 Node 内置测试工具和项目已有的 TypeScript 编译器，无需新增依赖：

```bash
node --test tests/search-history.test.mjs
```
