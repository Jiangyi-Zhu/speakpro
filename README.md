# SpeakPro - 职场英语口语训练平台

一个专为英语学习者设计的现代化口语训练平台，通过精选的职场英语视频帮助用户提升英语口语表达能力。

## 产品定位

面向职场人士的英语口语训练 SaaS 平台，提供从视频学习 → 词汇预习 → 学习生词 → 句子跟读 → 自由表达 → 学习总结的完整学习闭环。

## 核心功能

### 学习流程（6 步学习法）

| 步骤     | 功能          | 描述                              |
| ------ | ----------- | ------------------------------- |
| Step 1 | 视频学习        | HTML5 视频播放 + 实时字幕同步 + 逐句/段落粒度切换 + 4种循环模式 |
| Step 2 | 词汇预习 | 浏览全文点击标记生词，生词持久化到 DB |
| Step 3 | 学习生词 | 闪卡式逐词学习，查释义发音，原文语境高亮 |
| Step 4 | 句子跟读 | 逐句中英对照、语法解析、录音练习、原音对照、句子收藏 |
| Step 5 | 自由表达        | 开放问题录音回答，录完自动保存                     |
| Step 6 | 学习总结        | 生成学习成果卡片，自动标记课程完成                   |

### 视频播放器

- 原生 HTML5 `<video>` 播放（解决 react-player + React 19 不兼容问题）
- 实时字幕同步：基于 `timeupdate` 事件匹配 segment 时间戳
- 4 种播放模式：顺序播放 → 单句循环 → 循环N遍 → 全文循环
- 粒度切换：逐句（每个 segment）/ 段落（4句一组）
- 英文/中文字幕独立开关
- 点击文本对照区跳转播放

### 字幕导入工具链

```bash
# 1. 下载视频 + 字幕
yt-dlp --cookies-from-browser chrome -f "best[height<=480]" -o "public/videos/lesson1.mp4" "https://youtube.com/watch?v=VIDEO_ID"
yt-dlp --cookies-from-browser chrome --write-auto-sub --sub-lang "en-orig" --sub-format json3 --skip-download -o "public/videos/lesson1" "https://youtube.com/watch?v=VIDEO_ID"

# 2. 解析字幕 → 自动分句（json3 逐词毫秒级时间戳）
DATABASE_URL="..." npx tsx scripts/import-subtitles.ts \
  --json3 public/videos/lesson1.en-orig.json3 \
  --lesson-id <id> \
  [--translations translations.json] \
  [--pause-ms 900] [--min-duration 5] [--max-duration 16]

# 3. 校准现有 segment 时间轴（用 json3 词级数据修正）
DATABASE_URL="..." npx tsx scripts/fix-timestamps.ts \
  --json3 public/videos/lesson1.en-orig.json3 \
  --lesson-id <id>
```

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
| **框架** | Next.js 16 (App Router) + React 19 | SSR/SSG、API Routes、部署友好 |
| **语言** | TypeScript | 类型安全，适合大型项目 |
| **样式** | Tailwind CSS 4 + shadcn/ui | 快速开发、一致性、可定制 |
| **数据库** | PostgreSQL (Neon) | 关系型数据，Serverless 冷启动友好 |
| **ORM** | Prisma | 类型安全的数据库访问，迁移管理 |
| **认证** | NextAuth.js (Auth.js v5) | 生产级认证，支持多 Provider |
| **视频播放** | 原生 HTML5 `<video>` | React 19 兼容，字幕同步精确控制 |
| **字幕解析** | YouTube json3 (逐词时间戳) | 毫秒级精度，优于 SRT 的滑动窗口格式 |
| **部署** | Vercel（auto-deploy on push） | GitHub 集成，零配置 |

## 项目结构

```
workplace-english/
├── prisma/schema.prisma          # 数据库模型
├── scripts/
│   ├── import-subtitles.ts       # json3 → segments 解析器
│   ├── fix-timestamps.ts         # 用 json3 校准现有时间轴
│   └── seed-fine-segments.ts     # 手动 seed 脚本（含中文翻译）
├── public/videos/                # 视频 + 字幕文件
├── src/
│   ├── app/
│   │   ├── (auth)/               # 登录注册
│   │   ├── (main)/               # 主应用（需认证）
│   │   │   ├── dashboard/
│   │   │   ├── lessons/[id]/
│   │   │   │   ├── video/        # Step 1: 视频播放器
│   │   │   │   ├── vocabulary/   # Step 2: 词汇预习
│   │   │   │   ├── word-study/   # Step 3: 学习生词
│   │   │   │   ├── sentences/    # Step 4: 句子跟读
│   │   │   │   ├── expression/   # Step 5: 自由表达
│   │   │   │   └── summary/      # Step 6: 学习总结
│   │   │   ├── vocabulary-book/  # 生词本
│   │   │   └── saved-sentences/  # 收藏句子
│   │   ├── admin/                # 管理后台
│   │   └── api/                  # API Routes
│   ├── components/
│   │   ├── ui/                   # shadcn/ui
│   │   ├── layout/               # 布局组件
│   │   └── lesson/               # 课程组件（step-nav 等）
│   ├── hooks/                    # use-progress 等
│   └── lib/                      # db, auth, utils
```

## 数据库设计

详见 `prisma/schema.prisma`，核心表：

- **User** — 用户信息 + 学习统计
- **Account / Session** — NextAuth 认证表
- **Lesson** — 课程（视频 + 元数据）
- **LessonSegment** — 课程分段（逐句，含原文/翻译/语法解析/startTime/endTime）
- **UserProgress** — 用户学习进度（每课程每步骤）
- **VocabularyItem** — 生词本条目
- **Recording** — 用户录音记录
- **Expression** — 用户写作/口语表达
- **SavedSentence** — 收藏的句子
- **ExpressionQuestion** — 自由表达问题
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

```bash
git add -A
git commit -m "描述你改了什么"
git push
# Vercel 自动构建部署，1-2 分钟网站就更新
```

### 添加新课程

1. 用 yt-dlp 下载视频（480p）和 json3 字幕
2. 在数据库创建 Lesson 记录（可通过 Admin 后台或 Prisma Studio）
3. 运行 `import-subtitles.ts` 解析字幕生成 segments
4. 可选：准备 translations.json 添加中文翻译
5. 可选：运行 `fix-timestamps.ts` 用 json3 精校时间轴

### Vercel 环境变量

| 变量名 | 说明 |
|--------|------|
| `DATABASE_URL` | Neon PostgreSQL 连接字符串 |
| `NEXTAUTH_SECRET` | 认证加密密钥 |
| `NEXTAUTH_URL` | `https://speakpro-livid.vercel.app` |
