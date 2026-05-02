import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedUploadUrl } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { filename, contentType, category } = body;

  if ((category === "video" || category === "subtitle") && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  if (!filename || !contentType) {
    return NextResponse.json(
      { error: "filename and contentType required" },
      { status: 400 }
    );
  }

  const timestamp = Date.now();
  const ext = filename.split(".").pop();
  let key: string;

  switch (category) {
    case "video":
      key = `videos/${body.lessonId}/${timestamp}.${ext}`;
      break;
    case "recording":
      key = `recordings/${session.user.id}/${body.lessonId}/${timestamp}.${ext}`;
      break;
    case "subtitle":
      key = `subtitles/${body.lessonId}/${timestamp}.${ext}`;
      break;
    default:
      key = `uploads/${session.user.id}/${timestamp}.${ext}`;
  }

  const uploadUrl = await getPresignedUploadUrl(key, contentType);

  return NextResponse.json({ uploadUrl, key });
}
