# 开发计划

## 迭代规划

### Phase 0 — 基础框架（当前）
- [x] 项目初始化：Next.js + TypeScript + Tailwind
- [x] 数据库 Schema 设计（Prisma + PostgreSQL）
- [x] 认证系统骨架（NextAuth.js）
- [x] 项目目录结构
- [x] shadcn/ui 组件库集成
- [x] 基础布局组件（Header/Sidebar/Footer）
- [x] 环境变量模板

### Phase 1 — 核心学习流程（MVP）
- [ ] 课程列表页 + 详情页
- [ ] Step 1：视频播放器（字幕开关、双语对照）
- [ ] Step 2：文章浏览 + 生词标记
- [ ] Step 3：逐句学习 + 录音跟读
- [ ] Step 4：自由表达（文本输入 + 录音）
- [ ] Step 5：学习总结卡片
- [ ] 学习进度保存和恢复

### Phase 2 — 用户系统
- [ ] 注册 / 登录页面
- [ ] 用户 Dashboard
- [ ] 生词本页面
- [ ] 表达积累页面
- [ ] 录音管理页面
- [ ] 学习统计和连续打卡

### Phase 3 — 管理后台
- [ ] 视频上传 + 字幕解析
- [ ] 课程编辑器（逐句编辑翻译/语法）
- [ ] 用户管理
- [ ] 数据统计面板

### Phase 4 — 上线准备
- [ ] 生产环境部署（Vercel + 云数据库）
- [ ] S3 存储配置（视频/录音）
- [ ] CDN 加速
- [ ] 错误监控（Sentry）
- [ ] 分析埋点
- [ ] SEO 优化
- [ ] 移动端适配

### Phase 5 — 增值功能
- [ ] AI 发音评分（对比用户录音和原音）
- [ ] AI 语法纠错（自由表达环节）
- [ ] 社区分享
- [ ] 付费订阅系统

---

## 存储方案

### PostgreSQL（结构化数据）
- 用户信息、学习进度、生词本、课程元数据
- 推荐服务：Neon / Supabase（免费 tier 足够 MVP）

### S3 兼容存储（文件）
| 文件类型 | 预估大小 | 访问频率 |
|----------|----------|----------|
| 课程视频 | 50-200MB/个 | 高（CDN 缓存） |
| 字幕文件 | 5-50KB/个 | 低 |
| 用户录音 | 100KB-2MB/条 | 中 |
| 分享卡片 | 50-200KB/张 | 低 |

推荐服务：Cloudflare R2（无出站流量费）或 AWS S3

### 存储目录结构（S3）
```
bucket/
├── videos/
│   └── {lessonId}/
│       ├── video.mp4
│       └── thumbnail.jpg
├── subtitles/
│   └── {lessonId}/
│       ├── en.vtt
│       └── zh.vtt
├── audio-segments/
│   └── {lessonId}/
│       └── {segmentIndex}.mp3
├── recordings/
│   └── {userId}/
│       └── {lessonId}/
│           └── {segmentIndex}_{timestamp}.webm
└── cards/
    └── {userId}/
        └── {lessonId}_summary.png
```

---

## 待定决策（框架搭完后统一确认）

### 1. 部署和基础设施
- [ ] PostgreSQL 选择哪家云服务？（Neon / Supabase / 自建）
- [ ] 文件存储选择？（Cloudflare R2 / AWS S3 / 其他）
- [ ] 域名？

### 2. 认证方式
- [ ] 需要支持哪些 OAuth Provider？（Google / GitHub / 微信？）
- [ ] 是否需要手机号登录？

### 3. 内容管理
- [ ] 字幕文件格式偏好？（SRT / VTT / 两者都支持）
- [ ] 视频是本地上传还是也支持外链（YouTube 等）？
- [ ] 课程的语法解析是手动编辑还是 AI 辅助生成？

### 4. 商业模式
- [ ] 是否需要付费墙？如果需要，哪些功能收费？
- [ ] 是否需要支付集成？（Stripe / 其他）

### 5. 音频功能
- [ ] 录音格式偏好？（WebM / WAV）
- [ ] 是否需要 AI 发音评分？如果需要，用什么服务？

### 6. 其他
- [ ] 是否需要多语言 UI（当前假设中文 UI）？
- [ ] 是否需要 PWA / 移动 App？
