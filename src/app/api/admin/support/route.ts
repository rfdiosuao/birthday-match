import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/client";
import { supportResolutionSchema } from "@/lib/profile-schema";

export async function POST(request: Request) {
  const user = await getOptionalUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "无权执行此操作。" }, { status: 403 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "请求来源无效。" }, { status: 403 });

  const parsed = supportResolutionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "客服操作无效。" }, { status: 400 });

  try {
    await getRepository().resolveSupportRequest(user.id, parsed.data.requestId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "客服操作失败，请刷新后重试。" }, { status: 500 });
  }
}
