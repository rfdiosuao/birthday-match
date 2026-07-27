import { NextResponse } from "next/server";
import { displayCity, normalizeCity } from "@/lib/city";
import { profileSchema } from "@/lib/profile-schema";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  const value = parsed.data;
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      nickname: value.nickname,
      birthday_month: value.birthdayMonth,
      birthday_day: value.birthdayDay,
      city_name: displayCity(value.city),
      city_key: normalizeCity(value.city),
      bio: value.bio,
      celebration_style: value.celebrationStyle,
      budget_level: value.budgetLevel,
      group_size: value.groupSize,
      gender: value.gender,
      group_preference: value.groupPreference,
      activities: value.activities,
      contact_kind: value.contactKind,
      contact_value: value.contactValue,
      is_adult: value.isAdult,
      safety_accepted: value.safetyAccepted,
      visibility: value.visibility,
      onboarding_complete: true,
    },
    { onConflict: "id" },
  );

  if (error) return NextResponse.json({ error: "档案暂时无法保存，请稍后重试。" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
