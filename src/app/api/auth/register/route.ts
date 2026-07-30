import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { AuthServiceError, registerUser } from "@/lib/auth/service";
import { getRepository } from "@/lib/data/client";

export async function POST(request: Request) {
  const input = await request.json().catch(() => null);

  try {
    const user = await registerUser(getRepository(), input);
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      if (error.code === "email_exists") {
        return NextResponse.json({ error: "这个邮箱已经注册，请直接登录。" }, { status: 409 });
      }
      return NextResponse.json({ error: "请填写有效邮箱，密码至少需要 8 个字符。" }, { status: 400 });
    }
    return NextResponse.json({ error: "注册暂时不可用，请稍后重试。" }, { status: 500 });
  }
}
