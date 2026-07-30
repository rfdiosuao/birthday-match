import { NextResponse } from "next/server";
import { profileSchema } from "@/lib/profile-schema";
import { getOptionalUser } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/client";

export async function POST(request: Request) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "登录状态已失效，请重新登录。" }, { status: 401 });

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "提交内容格式不正确。" }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "请检查填写内容。" }, { status: 400 });
  }

  try {
    await getRepository().upsertProfile(user.id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "档案暂时无法保存，请稍后重试。" }, { status: 500 });
  }
}
