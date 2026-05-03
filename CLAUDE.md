# SpeakPro - 职场英语口语训练平台

## 项目概述
基于 Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Prisma + PostgreSQL 的全栈 SaaS 平台。
部署在 Vercel，项目名 `speakpro`，生产 URL: `https://speakpro-livid.vercel.app`

## 开发命令
- `npm run dev` — 启动开发服务器
- `npm run build` — 生产构建
- `npx prisma db push` — 同步 Schema 到数据库
- `npx prisma generate` — 生成 Prisma Client
- `npx prisma studio` — 数据库可视化管理

## 代码规范
- 使用 App Router (src/app/)，不使用 Pages Router
- Server Components 优先，仅在需要交互时使用 Client Components（"use client"）
- API Routes 放在 src/app/api/ 下
- 数据库访问统一通过 src/lib/db.ts 的 prisma 实例
- 样式使用 Tailwind CSS utility classes
- 路径别名 @/* 指向 src/*

## 学习流程（6步）
1. **video** — 视频学习（ReactPlayer）
2. **vocabulary** — 词汇预习（标记生词）
3. **word-study** — 学习生词（查释义、语境高亮）
4. **sentences** — 句子跟读（播放原音 + 录音对比）
5. **expression** — 自由表达（录音回答开放问题，自动保存）
6. **summary** — 学习总结（自动标记完成）

## 录音持久化模式
- 录音状态用 `Map<number, string>` 管理，从 DB 初始化（base64 data URI）
- 新录音用 `URL.createObjectURL(blob)` 创建独立 URL（不能用 recorder 的，会被 revoke）
- `useRef` 追踪当前录音属于哪个 segment/question
- `useEffect` 监听 `recorder.audioBlob` 变化自动上传

## 认证与权限
- NextAuth v5 (Auth.js)，JWT 策略，role 在 jwt callback 中从 DB 读取（仅登录时）
- 修改用户 role 后，该用户需重新登录才能生效（JWT 不会自动刷新 role）
- 登出必须用 `signOut()` from `next-auth/react`（不能用 form POST，缺 CSRF token）
- Header 中通过 `useSession()` 获取 session，管理员显示「管理」入口

## 安全规则
- 所有 API 需 auth() 鉴权（dictionary 也需要）
- Admin 操作需 `session.user.role === "ADMIN"` 检查
- 音频上传限制 5MB
- Progress step 只增不减（取 Math.max）
- Lesson GET 对非 admin 过滤 published
- /api/admin/users/[id]/role 有防止自降级保护（不能降级自己）

## 管理后台 (/admin)
- layout.tsx 做 ADMIN role 检查，非管理员重定向 /dashboard
- Header 对管理员显示紫色「管理」入口（useSession 检测 role）
- /admin — 仪表盘：8项指标 + 课程完成率 + 最近学习动态 + 最近注册
- /admin/lessons — 课程管理：发布/取消/删除（actions.tsx 客户端组件）
- /admin/users — 用户管理：角色切换（role-toggle.tsx 客户端组件）
- API: /api/admin/users/[id]/role (PATCH) — 修改用户角色

## 目录结构
- `src/app/(auth)/` — 登录注册页面
- `src/app/(main)/` — 主应用页面（需认证）
- `src/app/admin/` — 管理后台（layout 做 role 检查）
- `src/app/api/` — API 接口
- `src/app/api/admin/` — 管理后台专用 API（用户角色等）
- `src/components/layout/` — Header（含底部 tab 导航，管理员显示管理入口）
- `src/components/signout-button.tsx` — 客户端登出按钮（next-auth/react signOut）
- `src/components/lesson/` — StepNav 步骤导航
- `src/hooks/` — useAudioRecorder, useProgress, useStudyTimer
- `src/lib/` — db, auth, auth-config, storage, utils
- `prisma/schema.prisma` — 数据库模型

## 环境配置
- 本地 .env: DATABASE_URL="file:./dev.db"（SQLite，仅本地开发）
- 线上环境变量存 Vercel（加密），`vercel env pull` 拉不下来值
- Vercel 项目需 `vercel link --project speakpro` 关联
- 管理员账号: jiangyizhu78@gmail.com (线上 ADMIN)
- README 中的 admin@speakpro.com / demo@speakpro.com 是占位，线上不存在

## 已知待做
- 音频存储迁移到对象存储（当前 base64 存 PostgreSQL）
- 忘记密码/重置密码流程
- 列表页分页
- JWT role 自动刷新（当前修改 role 需用户重新登录）
