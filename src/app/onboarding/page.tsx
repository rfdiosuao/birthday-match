import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile-form";
import { createClient, requireUser } from "@/lib/supabase/server";
import type { BirthdayProfile } from "@/lib/types";

export const metadata: Metadata = { title: "我的生日档案" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const profile = data ? (data as unknown as BirthdayProfile) : null;

  return (
    <main id="main-content" className="profile-page">
      <div className="profile-heading">
        <p className="kicker">{profile ? "更新匹配依据" : "建立生日档案"}</p>
        <h1>{profile ? "让档案继续像你." : "先说说，你想怎样过."}</h1>
        <p>出生年份不会被收集。联系方式只有在双方匹配成功后才会开放。</p>
      </div>
      <ProfileForm initialProfile={profile} />
    </main>
  );
}
