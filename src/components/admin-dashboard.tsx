"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminDashboardData, ModerationAction } from "@/lib/types";

const reasonLabels = {
  harassment: "骚扰或冒犯",
  false_information: "虚假信息",
  unsafe_behavior: "令人不安全",
  spam: "广告或垃圾信息",
  other: "其他",
};

const categoryLabels = {
  account_recovery: "账号恢复",
  safety: "安全问题",
  privacy: "隐私请求",
  general: "其他问题",
};

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  const [loadingId, setLoadingId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function moderate(reportId: string, action: ModerationAction) {
    if (action === "ban" && !window.confirm("确认永久停用被举报账号？该账号的所有会话会立即失效。")) return;
    await submit("/api/admin/moderation", { reportId, action }, reportId);
  }

  async function resolveSupport(requestId: string) {
    await submit("/api/admin/support", { requestId }, requestId);
  }

  async function submit(url: string, body: object, id: string) {
    setLoadingId(id);
    setError("");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "操作失败。");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "操作失败。");
    } finally {
      setLoadingId("");
    }
  }

  return (
    <div className="admin-sections">
      {error ? <p className="system-error" role="alert">{error}</p> : null}
      <section className="admin-section">
        <div className="admin-section-heading"><h2>举报记录</h2><span>{data.reports.filter((item) => item.status !== "resolved").length} 个待处理</span></div>
        {data.reports.length ? data.reports.map((report) => (
          <article className="admin-card" key={report.id}>
            <div className="admin-card-meta"><span>{reasonLabels[report.reason]}</span><span>{report.status}</span><time>{new Date(report.created_at).toLocaleString("zh-CN")}</time></div>
            <h3>{report.target_nickname || report.target_email} <small>被 {report.reporter_nickname || report.reporter_email} 举报</small></h3>
            <p>{report.details || "用户没有填写补充说明。"}</p>
            <p className="admin-account-state">账号状态：{report.target_status === "banned" ? "已停用" : "正常"}</p>
            <div className="admin-actions">
              <button type="button" onClick={() => moderate(report.id, "reviewing")} disabled={loadingId === report.id || report.status === "reviewing"}>标记审核中</button>
              <button type="button" onClick={() => moderate(report.id, "resolved")} disabled={loadingId === report.id || report.status === "resolved"}>关闭举报</button>
              <button className="danger" type="button" onClick={() => moderate(report.id, "ban")} disabled={loadingId === report.id || report.target_status === "banned"}>停用账号</button>
            </div>
          </article>
        )) : <p className="admin-empty">目前没有举报记录。</p>}
      </section>

      <section className="admin-section">
        <div className="admin-section-heading"><h2>客服请求</h2><span>{data.supportRequests.filter((item) => item.status === "open").length} 个待处理</span></div>
        {data.supportRequests.length ? data.supportRequests.map((request) => (
          <article className="admin-card" key={request.id}>
            <div className="admin-card-meta"><span>{categoryLabels[request.category]}</span><span>{request.status}</span><time>{new Date(request.created_at).toLocaleString("zh-CN")}</time></div>
            <h3>{request.email}</h3>
            <p>{request.message}</p>
            <div className="admin-actions">
              <a href={`mailto:${request.email}`}>回复邮件</a>
              <button type="button" onClick={() => resolveSupport(request.id)} disabled={loadingId === request.id || request.status === "resolved"}>标记已处理</button>
            </div>
          </article>
        )) : <p className="admin-empty">目前没有客服请求。</p>}
      </section>
    </div>
  );
}
