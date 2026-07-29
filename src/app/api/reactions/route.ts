import { NextResponse } from "next/server";
import { reactionSchema } from "@/lib/profile-schema";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "登录状态已失效，请重新登录。" }, { status: 401 });

  const parsed = reactionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "请求内容不正确。" }, { status: 400 });

  const { data, error } = await supabase.rpc("respond_to_candidate", {
    p_target_id: parsed.data.targetId,
    p_decision: parsed.data.decision,
  });
  if (error) return NextResponse.json({ error: "暂时无法记录选择，请稍后重试。" }, { status: 500 });

  const result = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({ matched: Boolean(result?.matched), connectionId: result?.connection_id || null });
}
