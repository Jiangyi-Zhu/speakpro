import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LESSON_ID = "lesson-job-interview";

const segments = [
  {
    textEn: `What do you do for a living?`,
    textZh: `你是做什么工作的？`,
    startTime: 0.24,
    endTime: 7.0,
  },
  {
    textEn: `Basically means what is your job, or what do you do to make money.`,
    textZh: `基本上就是问你的工作是什么，或者你靠什么赚钱。`,
    startTime: 7.0,
    endTime: 14.5,
  },
  {
    textEn: `However, in conversation we wouldn't usually ask someone "what do you do to make money" or "what is your job".`,
    textZh: `但在日常对话中，我们通常不会直接问别人"你靠什么赚钱"或"你的工作是什么"。`,
    startTime: 14.5,
    endTime: 22.7,
  },
  {
    textEn: `We usually ask "what do you do for a living", "what do you do for work", or just "what do you do".`,
    textZh: `我们通常会问"what do you do for a living"、"what do you do for work"，或者简单地说"what do you do"。`,
    startTime: 22.7,
    endTime: 30.0,
  },
  {
    textEn: `I'm Teacher Mike, and today we're learning how to talk about what you do for work when introducing yourself in English.`,
    textZh: `我是 Teacher Mike，今天我们来学习用英语自我介绍时如何谈论你的工作。`,
    startTime: 30.0,
    endTime: 39.4,
  },
  {
    textEn: `So the most common thing that we say is probably just "I'm" followed by your profession.`,
    textZh: `最常见的说法可能就是用"I'm"加上你的职业。`,
    startTime: 39.4,
    endTime: 46.8,
  },
  {
    textEn: `For example, I'm an English teacher and content creator.`,
    textZh: `例如，I'm an English teacher and content creator。`,
    startTime: 46.8,
    endTime: 52.4,
  },
  {
    textEn: `Another one that's very similar is "I work as".`,
    textZh: `另一个类似的说法是"I work as"。`,
    startTime: 52.4,
    endTime: 58.0,
  },
  {
    textEn: `This one is often used when the job is temporary or less connected to your identity.`,
    textZh: `这个说法常用于工作是临时的，或者和你的身份认同关系不大的时候。`,
    startTime: 58.0,
    endTime: 67.5,
  },
  {
    textEn: `It can sound more like this job is not an important part of who I am. It's just something that I'm doing right now to make money.`,
    textZh: `听起来更像是：这份工作不是我身份的重要组成部分，只是我现在用来赚钱的事情。`,
    startTime: 67.5,
    endTime: 80.3,
  },
  {
    textEn: `For example, he's a teacher but he also works as a cashier on the weekends.`,
    textZh: `例如，他是一名老师，但周末他还兼职做收银员。`,
    startTime: 80.3,
    endTime: 87.0,
  },
  {
    textEn: `Another very common way to explain what you do is to just explain what you do. "I" plus a verb.`,
    textZh: `另一个常见的方式就是直接描述你做什么——"I"加动词。`,
    startTime: 87.0,
    endTime: 97.0,
  },
  {
    textEn: `For example, I create social media content to help adults who are learning English as a second language.`,
    textZh: `例如，我制作社交媒体内容，帮助把英语作为第二语言学习的成年人。`,
    startTime: 97.0,
    endTime: 109.0,
  },
  {
    textEn: `If you want people to understand exactly what you do, this one is usually the best option because it tells them what you do.`,
    textZh: `如果你想让别人准确了解你的工作内容，这种说法通常是最好的选择，因为它直接告诉对方你做什么。`,
    startTime: 109.0,
    endTime: 119.0,
  },
  {
    textEn: `You can also use "I work for", "I work at", and "I work in".`,
    textZh: `你还可以用"I work for"、"I work at"和"I work in"。`,
    startTime: 119.0,
    endTime: 128.0,
  },
  {
    textEn: `"I work for" is usually followed by a type of company or the name of a company.`,
    textZh: `"I work for"后面通常跟公司类型或公司名称。`,
    startTime: 128.0,
    endTime: 138.0,
  },
  {
    textEn: `For example, I work for a software company. Or, she works for Microsoft.`,
    textZh: `例如，I work for a software company。或者，She works for Microsoft。`,
    startTime: 138.0,
    endTime: 148.0,
  },
  {
    textEn: `You could also use this with a specific person. For example, he works for his uncle.`,
    textZh: `你也可以用来指为某个具体的人工作。例如，he works for his uncle。`,
    startTime: 148.0,
    endTime: 155.5,
  },
  {
    textEn: `"I work at" is usually followed by a location. For example, I work at a bank.`,
    textZh: `"I work at"后面通常跟一个地点。例如，I work at a bank。`,
    startTime: 155.5,
    endTime: 168.0,
  },
  {
    textEn: `We can also use it with a company, but when we use "work at" a company it's a bit different from "work for" a company.`,
    textZh: `我们也可以跟公司名一起用，但"work at"和"work for"一家公司的含义稍有不同。`,
    startTime: 168.0,
    endTime: 178.3,
  },
  {
    textEn: `For example, I used to work at Batuman Princess Hotel in Bangkok, Thailand. The hotel only has one location.`,
    textZh: `例如，我以前在泰国曼谷的 Batuman Princess Hotel 工作。这家酒店只有一个地点。`,
    startTime: 178.3,
    endTime: 192.0,
  },
  {
    textEn: `Every day when I went to work I was at that location. So when people asked me where I worked, I usually said "I work at Batuman Princess Hotel".`,
    textZh: `每天上班我都在那个地方。所以当别人问我在哪工作时，我通常说"I work at Batuman Princess Hotel"。`,
    startTime: 192.0,
    endTime: 206.0,
  },
  {
    textEn: `However, there were also people who worked for the hotel but were not usually at the hotel.`,
    textZh: `但也有一些人为酒店工作，却不常在酒店里。`,
    startTime: 206.0,
    endTime: 213.0,
  },
  {
    textEn: `For example, the hotel's airport limousine drivers. They worked for the hotel but they spent most of their time at the airport, not at the hotel.`,
    textZh: `例如酒店的机场接送司机。他们为酒店工作，但大部分时间都在机场，不在酒店。`,
    startTime: 213.0,
    endTime: 227.0,
  },
  {
    textEn: `And here's another example that shows the difference. For about one year, I worked at a TV station two days per week.`,
    textZh: `再举一个例子来说明区别。有大约一年时间，我每周在一家电视台工作两天。`,
    startTime: 227.0,
    endTime: 240.0,
  },
  {
    textEn: `I would go to their headquarters and teach a group of employees.`,
    textZh: `我会去他们的总部给一组员工上课。`,
    startTime: 240.0,
    endTime: 248.0,
  },
  {
    textEn: `However, I did not work for that TV station. I worked for a training center that had a contract with them.`,
    textZh: `但我并不为那家电视台工作。我在一家与他们有合约的培训中心工作。`,
    startTime: 248.0,
    endTime: 260.0,
  },
  {
    textEn: `So although I worked at the TV station, I did not work for the TV station.`,
    textZh: `所以虽然我在电视台工作，但我并不为电视台工作。`,
    startTime: 260.0,
    endTime: 268.0,
  },
  {
    textEn: `"I work in" is usually followed by a field, department, or industry. For example, she works in finance. Or, he works in human resources.`,
    textZh: `"I work in"后面通常跟领域、部门或行业。例如，she works in finance。或者，he works in human resources。`,
    startTime: 268.0,
    endTime: 283.0,
  },
  {
    textEn: `And when giving more specific information about what we really do at our job, we often use "I'm responsible for".`,
    textZh: `当要更具体地说明我们在工作中到底做什么时，常用"I'm responsible for"。`,
    startTime: 283.0,
    endTime: 296.0,
  },
  {
    textEn: `"I'm responsible for" basically means that something is a very important part of your job and you are the main person who does this thing.`,
    textZh: `"I'm responsible for"基本上意味着某件事是你工作中非常重要的一部分，而且你是负责做这件事的主要人员。`,
    startTime: 296.0,
    endTime: 310.0,
  },
  {
    textEn: `For example, when I was the education manager of a language center back in 2017, I was responsible for hiring and training new teachers.`,
    textZh: `例如，2017年我在一家语言中心担任教育主管时，我负责招聘和培训新老师。`,
    startTime: 310.0,
    endTime: 323.0,
  },
  {
    textEn: `And if you work for yourself, you can say that you are self-employed. For example, I am a self-employed English teacher and content creator.`,
    textZh: `如果你为自己工作，你可以说你是 self-employed（自雇的）。例如，I am a self-employed English teacher and content creator。`,
    startTime: 323.0,
    endTime: 336.0,
  },
  {
    textEn: `If you have your own business, you can say that you have your own business, own your own business, or run your own business.`,
    textZh: `如果你有自己的生意，你可以说 have your own business、own your own business 或 run your own business。`,
    startTime: 336.0,
    endTime: 349.0,
  },
  {
    textEn: `And you're usually going to specify what type of business it is. For example, her mother runs a noodle stand at the night market.`,
    textZh: `而且你通常会说明是什么类型的生意。例如，她妈妈在夜市经营一个面摊。`,
    startTime: 349.0,
    endTime: 358.0,
  },
  {
    textEn: `Or, my uncle owns a Japanese restaurant.`,
    textZh: `或者，我叔叔开了一家日本餐厅。`,
    startTime: 358.0,
    endTime: 363.0,
  },
  {
    textEn: `And if you don't have a job right now, you can say that you are between jobs or unemployed.`,
    textZh: `如果你现在没有工作，你可以说你 between jobs（两份工作之间）或 unemployed（失业）。`,
    startTime: 363.0,
    endTime: 373.0,
  },
  {
    textEn: `Unemployed just means that you don't have a job. However, it can sometimes sound a tiny bit negative, like maybe you can't find a job or don't want a job.`,
    textZh: `Unemployed 就是没有工作的意思。但有时候听起来会有一点负面，好像你找不到工作或不想工作。`,
    startTime: 373.0,
    endTime: 390.0,
  },
  {
    textEn: `Between jobs means basically the same thing, but it also says that you had a job before and you're confident that you will have another job again soon.`,
    textZh: `Between jobs 意思差不多，但它还表达了你之前有工作，而且你有信心很快会再找到新工作。`,
    startTime: 390.0,
    endTime: 403.0,
  },
  {
    textEn: `So between jobs just sounds a bit more positive, whereas unemployed can sometimes sound a bit negative.`,
    textZh: `所以 between jobs 听起来更积极一些，而 unemployed 有时候听起来比较消极。`,
    startTime: 403.0,
    endTime: 413.0,
  },
  {
    textEn: `So what do you do for a living? Leave a comment and let me know.`,
    textZh: `那你是做什么工作的呢？留言告诉我吧。`,
    startTime: 413.0,
    endTime: 419.0,
  },
];

async function main() {
  await prisma.lessonSegment.deleteMany({
    where: { lessonId: LESSON_ID },
  });

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    await prisma.lessonSegment.create({
      data: {
        lessonId: LESSON_ID,
        index: i,
        textEn: seg.textEn,
        textZh: seg.textZh,
        startTime: seg.startTime,
        endTime: seg.endTime,
      },
    });
  }

  console.log(`Created ${segments.length} fine-grained segments`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
