import { NextResponse } from "next/server";
import { reactionSchema } from "@/lib/profile-schema";
import { getOptionalUser } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/client";

export async function POST(request: Request) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "登录状态已失效，请重新登录。" }, { status: 401 });

  const parsed = reactionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "请求内容不正确。" }, { status: 400 });

  try {
    const result = await getRepository().respondToCandidate(
      user.id,
      parsed.data.targetId,
      parsed.data.decision,
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "暂时无法记录选择，请稍后重试。" }, { status: 500 });
  }
}
