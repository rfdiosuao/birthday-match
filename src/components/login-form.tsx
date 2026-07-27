"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${origin}/auth/callback?next=/onboarding` },
      });
      if (error) throw error;
      setMessage("登录链接已经发送，请检查邮箱。链接在一段时间后会失效。");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "发送失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-form-panel">
      <form className="auth-form" onSubmit={submit}>
        <Mail aria-hidden="true" size={30} />
        <h2>使用邮箱登录</h2>
        <label className="field">
          <span>邮箱地址</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <button className="button button-primary button-wide" type="submit" disabled={loading}>
          {loading ? "正在发送" : "发送登录链接"}
        </button>
        {message ? <p className={isError ? "form-message error" : "form-message"} role="status">{message}</p> : null}
        <p className="form-legal">继续即表示你同意我们的 <Link href="/terms">用户协议</Link> 和 <Link href="/privacy">隐私政策</Link>。</p>
      </form>
    </section>
  );
}
