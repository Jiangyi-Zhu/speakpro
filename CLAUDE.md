# SpeakPro - 职场英语口语训练平台

## 项目概述
基于 Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Prisma + PostgreSQL 的全栈 SaaS 平台。

## 开发命令
- `npm run dev` — 启动开发服务器
- `npm run build` — 生产构建
- `npx prisma db push` — 同步 Schema 到数据库
- `npx prisma generate` — 生成 Prisma Client
- `npx prisma studio` — 数据库可视化管理

## 代码规范
- 使用 App Router (src/app/)，不使用 Pages Router
- 组件文件使用 PascalCase，工具文件使用 camelCase
- Server Components 优先，仅在需要交互时使用 Client Components（"use client"）
- API Routes 放在 src/app/api/ 下
- 数据库访问统一通过 src/lib/db.ts 的 prisma 实例
- 样式使用 Tailwind CSS utility classes + shadcn/ui 组件
- 路径别名 @/* 指向 src/*

## 目录结构
- `src/app/(auth)/` — 登录注册页面
- `src/app/(main)/` — 主应用页面（需认证）
- `src/app/admin/` — 管理后台
- `src/app/api/` — API 接口
- `src/components/ui/` — shadcn/ui 基础组件
- `src/components/layout/` — 布局组件
- `src/components/lesson/` — 课程相关组件
- `src/lib/` — 工具库（db, auth, storage, utils）
- `prisma/schema.prisma` — 数据库模型
