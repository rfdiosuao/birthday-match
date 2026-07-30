import type { Metadata } from "next";
import Link from "next/link";
import { ConnectionList } from "@/components/connection-list";
import { requireUser } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/client";
import type { Connection } from "@/lib/types";

export const metadata: Metadata = { title: "已匹配" };
export const dynamic = "force-dynamic";

export default async function ConnectionsPage() {
  const user = await requireUser();
  let connections: Connection[] = [];
  let loadError = false;
  try {
    connections = await getRepository().getConnections(user.id);
  } catch {
    loadError = true;
  }

  return (
    <main id="main-content" className="connections-page">
      <header className="connections-heading">
        <p className="kicker">双方都愿意以后</p>
        <h1>这些人，也想<br />和你一起过<span>.</span></h1>
        <p>先简单介绍自己，再共同确认预算、公共见面地点和离开方式。</p>
      </header>
      {loadError ? <p className="system-error" role="alert">匹配结果暂时无法加载，请稍后刷新。</p> : null}
      {connections.length ? <ConnectionList connections={connections} /> : (
        <section className="empty-connections">
          <span className="section-number">00</span>
          <div>
            <h2>还没有双向匹配。</h2>
            <p>当你和候选人都选择“想一起过”，这里才会显示双方的联系方式。</p>
            <Link className="button button-primary" href="/matches">继续找同日的人</Link>
          </div>
        </section>
      )}
    </main>
  );
}
