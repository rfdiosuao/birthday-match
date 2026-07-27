import type { ReactNode } from "react";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <main id="main-content" className="legal-page">
      <header>
        <p className="kicker">请在使用前阅读</p>
        <h1>{title}<span>.</span></h1>
        <p>更新日期：{updated}</p>
      </header>
      <article>{children}</article>
    </main>
  );
}
