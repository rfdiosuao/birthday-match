import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MatchDeck } from "@/components/match-deck";
import { createClient, requireUser } from "@/lib/supabase/server";
import type { BirthdayProfile, CandidateProfile } from "@/lib/types";

export const metadata: Metadata = { title: "找同日的人" };
export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: ownData } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!ownData) redirect("/onboarding");

  const profile = ownData as unknown as BirthdayProfile;
  if (profile.visibility === "paused") {
    return (
      <main id="main-content" className="state-page">
        <p className="kicker">档案已暂停</p>
        <h1>现在不会向你<br />推荐新的人<span>.</span></h1>
        <p>之前已经建立的匹配不会受到影响。重新开启档案后，可以继续查看候选人。</p>
        <Link className="button button-primary" href="/onboarding">重新开启档案</Link>
      </main>
    );
  }

  const { data, error } = await supabase.rpc("get_birthday_candidates");
  const candidates = error ? [] : (data as unknown as CandidateProfile[]);

  return (
    <main id="main-content" className="matches-page">
      <header className="dashboard-heading">
        <div>
          <p className="kicker">同城 · 同一天生日</p>
          <h1>看看今年，<br />会和谁一起过<span>.</span></h1>
        </div>
        <div className="dashboard-date" aria-label={`${profile.birthday_month} 月 ${profile.birthday_day} 日`}>
          <strong>{String(profile.birthday_month).padStart(2, "0")}</strong><i>/</i><strong>{String(profile.birthday_day).padStart(2, "0")}</strong>
          <span>{profile.city_name}</span>
        </div>
      </header>
      {error ? <p className="system-error" role="alert">候选人暂时无法加载，请稍后刷新页面。</p> : null}
      <MatchDeck initialCandidates={candidates} />
    </main>
  );
}
