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

## 安全规则
- 所有 API 需 auth() 鉴权（dictionary 也需要）
- Admin 操作需 `session.user.role === "ADMIN"` 检查
- 音频上传限制 5MB
- Progress step 只增不减（取 Math.max）
- Lesson GET 对非 admin 过滤 published

## 目录结构
- `src/app/(auth)/` — 登录注册页面
- `src/app/(main)/` — 主应用页面（需认证）
- `src/app/admin/` — 管理后台（layout 做 role 检查）
- `src/app/api/` — API 接口
- `src/components/layout/` — Header（含底部 tab 导航）、Footer
- `src/components/lesson/` — StepNav 步骤导航
- `src/hooks/` — useAudioRecorder, useProgress, useStudyTimer
- `src/lib/` — db, auth, auth-config, storage, utils
- `prisma/schema.prisma` — 数据库模型

## 已知待做
- 音频存储迁移到对象存储（当前 base64 存 PostgreSQL）
- 忘记密码/重置密码流程
- 列表页分页
