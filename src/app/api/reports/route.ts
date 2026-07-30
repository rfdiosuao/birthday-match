import { NextResponse } from "next/server";
import { reportSchema } from "@/lib/profile-schema";
import { getOptionalUser } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/client";

export async function POST(request: Request) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "登录状态已失效，请重新登录。" }, { status: 401 });

  const parsed = reportSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "请检查举报内容。" }, { status: 400 });

  try {
    await getRepository().createReport(
      user.id,
      parsed.data.targetId,
      parsed.data.reason,
      parsed.data.details,
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "举报暂时无法提交，请稍后重试。" }, { status: 500 });
  }
}
