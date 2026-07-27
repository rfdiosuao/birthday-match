import { NextResponse } from "next/server";
import { reportSchema } from "@/lib/profile-schema";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "登录状态已失效，请重新登录。" }, { status: 401 });

  const parsed = reportSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "请检查举报内容。" }, { status: 400 });

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_id: parsed.data.targetId,
    reason: parsed.data.reason,
    details: parsed.data.details,
  });
  if (error) return NextResponse.json({ error: "举报暂时无法提交，请稍后重试。" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
