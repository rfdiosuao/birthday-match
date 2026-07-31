import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { requireAdmin } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/client";

export const metadata: Metadata = { title: "运营后台", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const data = await getRepository().getAdminDashboard(admin.id);

  return (
    <main id="main-content" className="admin-page">
      <header>
        <p className="kicker">仅运营人员可见</p>
        <h1>安全与客服<br />处理后台<span>.</span></h1>
        <p>优先处理人身安全、骚扰和账号恢复问题。停用账号会立即清除该用户的登录会话并暂停档案。</p>
      </header>
      <AdminDashboard data={data} />
    </main>
  );
}
