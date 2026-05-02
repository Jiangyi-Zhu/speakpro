import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@speakpro.com" },
    update: {},
    create: {
      email: "admin@speakpro.com",
      name: "Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin user created:", admin.email);

  // Create demo user
  const demoPassword = await bcrypt.hash("demo1234", 12);
  const demo = await prisma.user.upsert({
    where: { email: "demo@speakpro.com" },
    update: {},
    create: {
      email: "demo@speakpro.com",
      name: "Demo User",
      passwordHash: demoPassword,
      role: "USER",
      streakDays: 3,
      totalMinutes: 45,
    },
  });
  console.log("Demo user created:", demo.email);

  // Create sample lessons
  const lesson1 = await prisma.lesson.upsert({
    where: { id: "lesson-job-interview" },
    update: {},
    create: {
      id: "lesson-job-interview",
      title: "Job Interview: Tell Me About Yourself",
      description:
        "Learn how to confidently introduce yourself in a job interview. Master key phrases, proper structure, and natural delivery.",
      difficulty: "INTERMEDIATE",
      category: "面试",
      tags: JSON.stringify(["interview", "self-introduction", "career"]),
      published: true,
      sortOrder: 1,
      duration: 180,
    },
  });

  // Add segments for lesson 1
  const segments1 = [
    {
      textEn:
        "Hi, thank you for having me today. I'm really excited about this opportunity.",
      textZh: "你好，感谢今天给我这个机会。我对这个机会感到非常兴奋。",
      grammarNote:
        '"Thank you for having me" is a polite opening. "having" is a gerund after the preposition "for".',
      startTime: 0,
      endTime: 5.2,
    },
    {
      textEn:
        "I've been working in the tech industry for about five years now, primarily in product management.",
      textZh: "我在科技行业工作了大约五年，主要从事产品管理。",
      grammarNote:
        '"I\'ve been working" uses the present perfect continuous to describe an ongoing experience. "primarily" is a formal alternative to "mainly".',
      startTime: 5.5,
      endTime: 11.0,
    },
    {
      textEn:
        "In my current role at TechCorp, I lead a team of six engineers and two designers.",
      textZh: "在我目前在 TechCorp 的职位上，我领导着一个由六名工程师和两名设计师组成的团队。",
      grammarNote:
        '"In my current role" is a common way to describe your present position. "lead" (present simple) describes a regular responsibility.',
      startTime: 11.3,
      endTime: 16.5,
    },
    {
      textEn:
        "We successfully launched three major features last quarter that increased user engagement by 40 percent.",
      textZh: "上个季度我们成功推出了三个主要功能，用户参与度提高了 40%。",
      grammarNote:
        '"Successfully launched" uses an adverb before the verb for emphasis. "that increased" is a relative clause modifying "features".',
      startTime: 16.8,
      endTime: 23.0,
    },
    {
      textEn:
        "What I'm most passionate about is solving complex problems and turning them into simple, elegant solutions.",
      textZh: "我最热衷的是解决复杂问题并将其转化为简单、优雅的解决方案。",
      grammarNote:
        '"What I\'m most passionate about" is a cleft sentence that puts emphasis on the passion. "turning X into Y" is a phrasal verb meaning to transform.',
      startTime: 23.3,
      endTime: 29.5,
    },
    {
      textEn:
        "I believe my experience in cross-functional collaboration would be a great fit for this position.",
      textZh: "我相信我在跨职能协作方面的经验非常适合这个职位。",
      grammarNote:
        '"I believe" is softer than "I think" in professional contexts. "would be a great fit" uses the conditional to sound polite rather than presumptuous.',
      startTime: 29.8,
      endTime: 35.0,
    },
    {
      textEn:
        "I'm particularly drawn to your company's mission of making technology accessible to everyone.",
      textZh: "我尤其被贵公司让技术对每个人都触手可及的使命所吸引。",
      grammarNote:
        '"I\'m drawn to" expresses attraction/interest more elegantly than "I like". "making technology accessible" uses a gerund phrase as the object.',
      startTime: 35.3,
      endTime: 40.5,
    },
    {
      textEn:
        "I'd love to bring my skills in agile methodology and data-driven decision making to your team.",
      textZh: "我很期待将我在敏捷方法论和数据驱动决策方面的技能带到贵团队。",
      grammarNote:
        '"I\'d love to" is a warm, professional way to express desire. "data-driven" is a compound adjective (hyphenated when before a noun).',
      startTime: 40.8,
      endTime: 46.0,
    },
  ];

  for (let i = 0; i < segments1.length; i++) {
    await prisma.lessonSegment.upsert({
      where: { lessonId_index: { lessonId: lesson1.id, index: i } },
      update: {},
      create: {
        lessonId: lesson1.id,
        index: i,
        ...segments1[i],
      },
    });
  }
  console.log(`Lesson "${lesson1.title}" created with ${segments1.length} segments`);

  // Lesson 2
  const lesson2 = await prisma.lesson.upsert({
    where: { id: "lesson-email-writing" },
    update: {},
    create: {
      id: "lesson-email-writing",
      title: "Professional Email: Requesting a Meeting",
      description:
        "Learn how to write clear, professional emails to request meetings with colleagues or clients. Practice formal tone and polite expressions.",
      difficulty: "BEGINNER",
      category: "邮件",
      tags: JSON.stringify(["email", "meeting", "formal"]),
      published: true,
      sortOrder: 2,
      duration: 150,
    },
  });

  const segments2 = [
    {
      textEn: "Subject: Meeting Request — Q3 Marketing Strategy Review",
      textZh: "主题：会议请求 — 第三季度营销策略回顾",
      grammarNote:
        "Email subjects should be concise and specific. Using an em dash (—) separates the action from the topic.",
      startTime: 0,
      endTime: 4.0,
    },
    {
      textEn: "Dear Ms. Johnson, I hope this email finds you well.",
      textZh: "尊敬的 Johnson 女士，希望您一切顺利。",
      grammarNote:
        '"Dear Ms./Mr." is the standard formal greeting. "I hope this email finds you well" is a common professional opening.',
      startTime: 4.2,
      endTime: 8.5,
    },
    {
      textEn:
        "I'm writing to request a meeting to discuss our Q3 marketing strategy and budget allocation.",
      textZh: "我写信是想请求召开一次会议，讨论我们第三季度的营销策略和预算分配。",
      grammarNote:
        '"I\'m writing to" clearly states the purpose upfront. "budget allocation" is a compound noun common in business English.',
      startTime: 8.8,
      endTime: 14.0,
    },
    {
      textEn:
        "Would you be available sometime next week? I'm flexible on Tuesday or Thursday afternoon.",
      textZh: "您下周有空吗？我周二或周四下午都方便。",
      grammarNote:
        '"Would you be available" is more polite than "Are you free". "I\'m flexible on" is a natural way to suggest multiple options.',
      startTime: 14.3,
      endTime: 19.5,
    },
    {
      textEn:
        "The meeting should take approximately 30 minutes. I'll prepare a brief overview of the current metrics.",
      textZh: "会议大约需要 30 分钟。我会准备一份当前指标的简要概述。",
      grammarNote:
        '"Approximately" is more formal than "about". "I\'ll prepare" shows initiative and professionalism.',
      startTime: 19.8,
      endTime: 25.0,
    },
    {
      textEn:
        "Please let me know if this works for you, or suggest an alternative time that suits your schedule.",
      textZh: "请告诉我这个时间是否合适，或者建议一个适合您日程的其他时间。",
      grammarNote:
        '"Please let me know if" is a polite request. "that suits your schedule" is a relative clause showing consideration for the other person.',
      startTime: 25.3,
      endTime: 31.0,
    },
  ];

  for (let i = 0; i < segments2.length; i++) {
    await prisma.lessonSegment.upsert({
      where: { lessonId_index: { lessonId: lesson2.id, index: i } },
      update: {},
      create: {
        lessonId: lesson2.id,
        index: i,
        ...segments2[i],
      },
    });
  }
  console.log(`Lesson "${lesson2.title}" created with ${segments2.length} segments`);

  // Lesson 3
  const lesson3 = await prisma.lesson.upsert({
    where: { id: "lesson-team-meeting" },
    update: {},
    create: {
      id: "lesson-team-meeting",
      title: "Team Meeting: Giving a Project Update",
      description:
        "Practice presenting project progress in a team meeting. Learn status update vocabulary, how to discuss blockers, and next steps.",
      difficulty: "ADVANCED",
      category: "会议",
      tags: JSON.stringify(["meeting", "presentation", "project-management"]),
      published: true,
      sortOrder: 3,
      duration: 210,
    },
  });

  const segments3 = [
    {
      textEn:
        "Alright everyone, let me give you a quick update on Project Aurora.",
      textZh: "好的各位，让我给大家简要汇报一下 Aurora 项目的进展。",
      grammarNote:
        '"Let me give you a quick update on" is a natural way to start a status update. "Alright everyone" is a casual but professional way to get attention.',
      startTime: 0,
      endTime: 4.5,
    },
    {
      textEn:
        "As of this week, we've completed 80 percent of the backend refactoring, which is right on schedule.",
      textZh: "截至本周，我们已完成了 80% 的后端重构，完全按照计划进行。",
      grammarNote:
        '"As of this week" gives a clear time reference. "right on schedule" is an idiom meaning exactly according to plan.',
      startTime: 4.8,
      endTime: 10.5,
    },
    {
      textEn:
        "However, we've hit a blocker with the third-party API integration that I want to flag.",
      textZh: "不过，我们在第三方 API 集成方面遇到了一个阻塞问题，我想提请大家注意。",
      grammarNote:
        '"We\'ve hit a blocker" is tech industry jargon for encountering an obstacle. "flag" here means to bring to attention.',
      startTime: 10.8,
      endTime: 16.0,
    },
    {
      textEn:
        "The vendor hasn't provided the updated documentation yet, and that's blocking our testing phase.",
      textZh: "供应商还没有提供更新的文档，这阻碍了我们的测试阶段。",
      grammarNote:
        '"hasn\'t provided" (present perfect negative) indicates something expected but not yet received. "that\'s blocking" connects cause and effect.',
      startTime: 16.3,
      endTime: 21.5,
    },
    {
      textEn:
        "I've already reached out to their team and escalated the issue to their account manager.",
      textZh: "我已经联系了他们的团队，并将问题升级到他们的客户经理。",
      grammarNote:
        '"reached out to" is a professional way to say "contacted". "escalated" means raising an issue to a higher level of authority.',
      startTime: 21.8,
      endTime: 27.0,
    },
  ];

  for (let i = 0; i < segments3.length; i++) {
    await prisma.lessonSegment.upsert({
      where: { lessonId_index: { lessonId: lesson3.id, index: i } },
      update: {},
      create: {
        lessonId: lesson3.id,
        index: i,
        ...segments3[i],
      },
    });
  }
  console.log(`Lesson "${lesson3.title}" created with ${segments3.length} segments`);

  // Add expression questions
  const questions = [
    {
      lessonId: lesson1.id,
      question: "How would you introduce yourself for a product manager role at a tech startup?",
      hint: "Include your background, key achievements, and why you're interested in the company.",
      sortOrder: 0,
    },
    {
      lessonId: lesson1.id,
      question: "What would you say if the interviewer asked about a challenging project you managed?",
      hint: "Use the STAR method: Situation, Task, Action, Result.",
      sortOrder: 1,
    },
    {
      lessonId: lesson2.id,
      question: "Write an email to your manager requesting time off next Friday.",
      hint: "Be professional, state the reason briefly, and mention how you'll handle pending work.",
      sortOrder: 0,
    },
    {
      lessonId: lesson3.id,
      question: "Give a status update on a project that is two weeks behind schedule. How would you communicate this?",
      hint: "Be transparent about the delay, explain the cause, and propose a recovery plan.",
      sortOrder: 0,
    },
  ];

  for (const q of questions) {
    await prisma.expressionQuestion.create({ data: q });
  }
  console.log(`${questions.length} expression questions created`);

  // Add achievements
  const achievements = [
    { name: "first-lesson", description: "完成第一课", icon: "🎯", condition: '{"lessonsCompleted":1}' },
    { name: "word-collector-10", description: "收集 10 个生词", icon: "📚", condition: '{"wordsCollected":10}' },
    { name: "word-collector-50", description: "收集 50 个生词", icon: "📖", condition: '{"wordsCollected":50}' },
    { name: "streak-3", description: "连续学习 3 天", icon: "🔥", condition: '{"streakDays":3}' },
    { name: "streak-7", description: "连续学习 7 天", icon: "💪", condition: '{"streakDays":7}' },
    { name: "streak-30", description: "连续学习 30 天", icon: "🏆", condition: '{"streakDays":30}' },
    { name: "recorder-10", description: "完成 10 次录音练习", icon: "🎙️", condition: '{"recordingsMade":10}' },
    { name: "all-steps", description: "完成一课的全部 5 个步骤", icon: "⭐", condition: '{"allStepsCompleted":true}' },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { name: a.name },
      update: {},
      create: a,
    });
  }
  console.log(`${achievements.length} achievements created`);

  console.log("\nSeed completed successfully!");
  console.log("Admin login: admin@speakpro.com / admin123");
  console.log("Demo login:  demo@speakpro.com / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
