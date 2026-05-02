import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ExpressionsClient } from "./client";

export default async function ExpressionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const expressions = await prisma.expression.findMany({
    where: { userId: session.user.id },
    include: {
      lesson: { select: { id: true, title: true } },
      question: { select: { question: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const items = expressions
    .filter((e) => e.question !== null)
    .map((e) => ({
      id: e.id,
      type: e.type,
      content: e.content || "",
      audioUrl: e.audioUrl || "",
      question: e.question!.question,
      lessonId: e.lesson.id,
      lessonTitle: e.lesson.title,
      createdAt: e.createdAt.toISOString(),
    }));

  return <ExpressionsClient expressions={items} />;
}
