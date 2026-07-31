import { NextResponse } from "next/server";
import { getRepository } from "@/lib/data/client";
import { supportRequestSchema } from "@/lib/profile-schema";

export async function POST(request: Request) {
  const parsed = supportRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "请检查邮箱和问题描述，说明至少需要 20 个字。" }, { status: 400 });
  }

  if (parsed.data.website) return NextResponse.json({ ok: true });

  try {
    await getRepository().createSupportRequest({
      category: parsed.data.category,
      email: parsed.data.email.toLowerCase(),
      message: parsed.data.message,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "暂时无法提交，请稍后重试。" }, { status: 500 });
  }
}
