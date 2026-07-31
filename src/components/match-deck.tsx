"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { Flag, Heart, MapPin, X } from "lucide-react";
import { birthdayVisuals, visualForCandidate } from "@/lib/birthday-visuals";
import { labels } from "@/lib/constants";
import type { CandidateProfile } from "@/lib/types";

export function MatchDeck({ initialCandidates }: { initialCandidates: CandidateProfile[] }) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [matchedName, setMatchedName] = useState("");
  const [reporting, setReporting] = useState<CandidateProfile | null>(null);
  const candidate = candidates[0];
  const candidateVisual = candidate ? visualForCandidate(candidate) : null;

  async function react(decision: "interested" | "pass") {
    if (!candidate || loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: candidate.id, decision }),
      });
      const result = (await response.json()) as { error?: string; matched?: boolean };
      if (!response.ok) throw new Error(result.error || "操作失败，请稍后重试。");
      if (result.matched) setMatchedName(candidate.nickname);
      setCandidates((current) => current.slice(1));
    } catch (reactionError) {
      setError(reactionError instanceof Error ? reactionError.message : "操作失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  async function submitReport(reason: string, details: string) {
    if (!reporting) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: reporting.id, reason, details }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "提交失败，请稍后重试。");
      setCandidates((current) => current.filter((item) => item.id !== reporting.id));
      setReporting(null);
    } catch (reportError) {
      setError(reportError instanceof Error ? reportError.message : "提交失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  if (matchedName) {
    return (
      <section className="match-success" aria-live="polite">
        <Image
          className="match-success-image"
          src={birthdayVisuals.twoCakesMatch.src}
          alt={birthdayVisuals.twoCakesMatch.alt}
          fill
          sizes="100vw"
        />
        <div className="match-success-scrim" aria-hidden="true" />
        <div className="match-success-content">
          <p className="section-number">MATCH</p>
          <h2>你和 {matchedName}<br />都想一起过<span>.</span></h2>
          <p>联系方式已经向双方开放。先打个招呼，再共同确认公共见面地点和当天计划。</p>
          <div className="hero-actions">
            <Link className="button button-inverse" href="/connections">查看联系方式</Link>
            <button className="text-button inverse" type="button" onClick={() => setMatchedName("")}>继续查看</button>
          </div>
        </div>
      </section>
    );
  }

  if (!candidate) {
    return (
      <section className="empty-candidates">
        <span className="section-number">00</span>
        <div>
          <p className="kicker">暂时没有新的候选人</p>
          <h2>同一天的人，<br />可能还没来到这里。</h2>
          <p>你的档案会继续参与匹配。可以过一段时间再回来，也可以邀请同一天生日的人加入。</p>
          <button className="button button-primary" type="button" onClick={() => navigator.clipboard.writeText("今年我想好好过生日——找到同城、同一天生日，也想认真庆祝的人。")}>复制邀请文案</button>
        </div>
        <figure className="empty-state-visual">
          <Image
            src={birthdayVisuals.rainySelfCelebration.src}
            alt={birthdayVisuals.rainySelfCelebration.alt}
            fill
            sizes="(max-width: 760px) 100vw, 34vw"
          />
          <figcaption>等别人来到以前，也别忘了好好陪自己。</figcaption>
        </figure>
      </section>
    );
  }

  return (
    <section className="candidate-workspace">
      <div className="candidate-count">
        <span>当前候选</span>
        <strong>01</strong>
        <small>本轮还有 {candidates.length} 人</small>
      </div>

      <article className="candidate-card">
        <div className="candidate-card-top">
          <div>
            <p className="kicker">匹配度 {candidate.compatibility}%</p>
            <h2>{candidate.nickname}</h2>
          </div>
          <div className="candidate-date" aria-label={`${candidate.birthday_month} 月 ${candidate.birthday_day} 日`}>
            {String(candidate.birthday_month).padStart(2, "0")}<i>/</i>{String(candidate.birthday_day).padStart(2, "0")}
          </div>
        </div>
        {candidateVisual ? (
          <figure className="candidate-inspiration">
            <Image
              src={candidateVisual.src}
              alt={candidateVisual.alt}
              fill
              sizes="(max-width: 760px) 100vw, 55vw"
            />
            <figcaption>{candidateVisual.note}</figcaption>
          </figure>
        ) : null}
        <p className="candidate-city"><MapPin aria-hidden="true" size={17} />{candidate.city_name}</p>
        <blockquote>{candidate.bio}</blockquote>
        <dl className="candidate-facts">
          <div><dt>庆祝方式</dt><dd>{labels.celebrationStyle[candidate.celebration_style]}</dd></div>
          <div><dt>人均预算</dt><dd>{labels.budgetLevel[candidate.budget_level]}</dd></div>
          <div><dt>期待人数</dt><dd>{labels.groupSize[candidate.group_size]}</dd></div>
        </dl>
        <div className="candidate-activities">
          <p>都想做的事</p>
          <div>
            {(candidate.shared_activities.length ? candidate.shared_activities : candidate.activities.slice(0, 3)).map((activity) => <span key={activity}>{labels.activity[activity]}</span>)}
          </div>
        </div>
        <p className="privacy-note">联系方式将在双方都选择“想一起过”后开放。</p>
      </article>

      <div className="candidate-actions">
        <button className="decision-button pass" type="button" onClick={() => react("pass")} disabled={loading}><X aria-hidden="true" />这次不合适</button>
        <button className="decision-button interested" type="button" onClick={() => react("interested")} disabled={loading}><Heart aria-hidden="true" />想一起过</button>
        <button className="report-button" type="button" onClick={() => setReporting(candidate)}><Flag aria-hidden="true" size={15} />举报或屏蔽</button>
        {error ? <p className="form-message error" role="alert">{error}</p> : null}
      </div>

      {reporting ? <ReportDialog nickname={reporting.nickname} loading={loading} onClose={() => setReporting(null)} onSubmit={submitReport} /> : null}
    </section>
  );
}

function ReportDialog({ nickname, loading, onClose, onSubmit }: { nickname: string; loading: boolean; onClose: () => void; onSubmit: (reason: string, details: string) => Promise<void> }) {
  const [reason, setReason] = useState("unsafe_behavior");
  const [details, setDetails] = useState("");

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="report-dialog" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <p className="kicker">举报或屏蔽</p>
        <h2 id="report-title">不再向你推荐 {nickname}</h2>
        <label className="field">
          <span>原因</span>
          <select value={reason} onChange={(event) => setReason(event.target.value)}>
            <option value="unsafe_behavior">令人感到不安全</option>
            <option value="harassment">骚扰或冒犯</option>
            <option value="false_information">虚假信息</option>
            <option value="spam">广告或垃圾信息</option>
            <option value="other">其他</option>
          </select>
        </label>
        <label className="field">
          <span>补充说明（可选）</span>
          <textarea value={details} maxLength={500} onChange={(event) => setDetails(event.target.value)} />
        </label>
        <div className="dialog-actions">
          <button className="text-button" type="button" onClick={onClose}>取消</button>
          <button className="button button-primary" type="button" disabled={loading} onClick={() => onSubmit(reason, details)}>{loading ? "正在提交" : "确认提交"}</button>
        </div>
      </section>
    </div>
  );
}
