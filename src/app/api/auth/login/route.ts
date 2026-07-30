import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { authenticateUser, AuthServiceError } from "@/lib/auth/service";
import { getRepository } from "@/lib/data/client";

export async function POST(request: Request) {
  const input = await request.json().catch(() => null);

  try {
    const user = await authenticateUser(getRepository(), input);
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return NextResponse.json({ error: "邮箱或密码不正确。" }, { status: 401 });
    }
    return NextResponse.json({ error: "登录暂时不可用，请稍后重试。" }, { status: 500 });
  }
}
