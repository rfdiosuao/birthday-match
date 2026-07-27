import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getOptionalUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "登录" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getOptionalUser();
  if (user) redirect("/matches");

  return (
    <main id="main-content" className="auth-page">
      <section className="auth-message">
        <p className="kicker">开始之前</p>
        <h1>先确认，<br />这是你<span>.</span></h1>
        <p>我们会向你的邮箱发送一次性登录链接，不需要设置密码。</p>
        <div className="auth-date" aria-hidden="true">MM<span>/</span>DD</div>
      </section>
      <LoginForm />
    </main>
  );
}
