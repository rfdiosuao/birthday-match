import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/client";
import { moderationSchema } from "@/lib/profile-schema";

export async function POST(request: Request) {
  const user = await getOptionalUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "无权执行此操作。" }, { status: 403 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "请求来源无效。" }, { status: 403 });

  const parsed = moderationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "审核操作无效。" }, { status: 400 });

  try {
    await getRepository().moderateReport(user.id, parsed.data.reportId, parsed.data.action);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "审核操作失败，请刷新后重试。" }, { status: 500 });
  }
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
