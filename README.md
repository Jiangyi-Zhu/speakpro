# SpeakPro - 职场英语口语训练平台

一个专为英语学习者设计的现代化口语训练平台，通过精选的职场英语视频帮助用户提升英语口语表达能力。

## 产品定位

面向职场人士的英语口语训练 SaaS 平台，提供从视频学习 → 词汇预习 → 跟读练习 → 自由表达 → 学习总结的完整学习闭环。

## 核心功能

### 学习流程（5 步学习法）

| 步骤 | 功能 | 描述 |
|------|------|------|
| Step 1 | 视频学习 | 带字幕视频播放 + 双语文本对照，支持英文/中文字幕开关 |
| Step 2 | 文章初览 + 词汇预习 | 浏览全文标记生词，学习释义和用法，生词收藏到生词本 |
| Step 3 | 句子学习 + 跟读练习 | 逐句中文对照（可开关）、语法解析、录音练习、原音对照、句子收藏 |
| Step 4 | 自由表达 | 开放问题口语或写作表达 |
| Step 5 | 学习总结 | 生成个性化学习成果分享卡片 |

### 用户系统

- 注册 / 登录（邮箱 + OAuth）
- 学习统计：学习天数、连续打卡、成就徽章
- 个人空间：生词本、表达积累、录音管理、写作记录
- 历史记录：学过的课程及学习记录

### 管理后台（Admin）

- 上传视频 + 字幕文件（SRT/VTT）
- 编辑课程内容：逐句对照、语法解析、词汇标注
- 管理用户、查看学习数据
- 配置学习步骤和问题

## 技术栈

| 层级 | 技术选型 | 理由 |
|------|----------|------|
| **框架** | Next.js 16 (App Router) | SSR/SSG、API Routes、部署友好 |
| **语言** | TypeScript | 类型安全，适合大型项目 |
| **样式** | Tailwind CSS 4 + shadcn/ui | 快速开发、一致性、可定制 |
| **数据库** | PostgreSQL | 关系型数据，适合用户/课程/进度等结构化数据 |
| **ORM** | Prisma | 类型安全的数据库访问，迁移管理 |
| **认证** | NextAuth.js (Auth.js v5) | 生产级认证，支持多 Provider |
| **存储** | Cloudflare R2 / AWS S3 | 视频、音频文件存储（S3 兼容） |
| **部署** | Vercel + 独立 PostgreSQL | 前端 Vercel，数据库 Supabase/Neon |
| **音频处理** | Web Audio API + MediaRecorder | 浏览器端录音和音频对比 |
| **视频播放** | React Player | 支持字幕、倍速、进度控制 |

## 项目结构

```
workplace-english/
├── README.md
├── DEVELOPMENT_PLAN.md
├── CLAUDE.md
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (main)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── lessons/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── video/page.tsx
│   │   │   │       ├── vocabulary/page.tsx
│   │   │   │       ├── sentences/page.tsx
│   │   │   │       ├── expression/page.tsx
│   │   │   │       └── summary/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   └── vocabulary-book/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── lessons/
│   │   │       ├── page.tsx
│   │   │       └── [id]/edit/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── lessons/route.ts
│   │       ├── progress/route.ts
│   │       ├── vocabulary/route.ts
│   │       ├── recordings/route.ts
│   │       └── upload/route.ts
│   ├── components/
│   │   ├── ui/           (shadcn/ui)
│   │   ├── layout/
│   │   ├── lesson/
│   │   └── player/
│   ├── lib/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   ├── auth-config.ts
│   │   ├── storage.ts
│   │   └── utils.ts
│   ├── hooks/
│   └── types/
├── .env.example
└── package.json
```

## 数据库设计

详见 `prisma/schema.prisma`，核心表：

- **User** — 用户信息 + 学习统计
- **Account / Session** — NextAuth 认证表
- **Lesson** — 课程（视频 + 元数据）
- **LessonSegment** — 课程分段（逐句，含原文/翻译/语法解析/音频时间戳）
- **UserProgress** — 用户学习进度（每课程每步骤）
- **VocabularyItem** — 生词本条目
- **Recording** — 用户录音记录
- **Expression** — 用户写作/口语表达
- **SavedSentence** — 收藏的句子
- **Achievement / UserAchievement** — 成就徽章

## 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local

# 初始化数据库（需要本地或远程 PostgreSQL）
npx prisma db push

# 启动开发服务器
npm run dev
```

## 线上环境

- **网站地址**: https://speakpro-livid.vercel.app
- **GitHub 仓库**: https://github.com/Jiangyi-Zhu/speakpro
- **数据库**: Neon PostgreSQL (us-east-1)
- **Vercel 控制台**: https://vercel.com/jiangyi-zhus-projects/speakpro

### 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | `admin@speakpro.com` | `admin123` |
| 演示用户 | `demo@speakpro.com` | `demo1234` |

### 更新部署流程

本地改完代码后，3 步更新线上：

```bash
git add -A
git commit -m "描述你改了什么"
git push
```

push 到 GitHub 后，Vercel 自动构建部署，1-2 分钟网站就更新了。

### Vercel 环境变量

在 Vercel 控制台 Settings → Environment Variables 中配置：

| 变量名 | 说明 |
|--------|------|
| `DATABASE_URL` | Neon PostgreSQL 连接字符串 |
| `NEXTAUTH_SECRET` | 认证加密密钥 |
| `NEXTAUTH_URL` | `https://speakpro-livid.vercel.app` |
