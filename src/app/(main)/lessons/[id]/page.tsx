import { redirect } from "next/navigation";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/lessons/${id}/video`);
}
