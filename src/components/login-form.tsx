"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "操作失败，请稍后重试。");

      router.push(mode === "register" ? "/onboarding" : "/matches");
      router.refresh();
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
        <LockKeyhole aria-hidden="true" size={30} />
        <div className="auth-mode-switch" aria-label="登录方式">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => {
            setMode("login");
            setMessage("");
          }}>登录</button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => {
            setMode("register");
            setMessage("");
          }}>注册</button>
        </div>
        <h2>{mode === "login" ? "欢迎回来" : "建立你的账号"}</h2>
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
        <label className="field">
          <span>密码</span>
          <input
            type="password"
            name="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={8}
            maxLength={128}
            placeholder="至少 8 个字符"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button className="button button-primary button-wide" type="submit" disabled={loading}>
          {loading ? "正在处理" : mode === "login" ? "登录" : "注册并开始"}
        </button>
        {message ? <p className={isError ? "form-message error" : "form-message"} role="status">{message}</p> : null}
        <p className="form-legal">继续即表示你同意我们的 <Link href="/terms">用户协议</Link> 和 <Link href="/privacy">隐私政策</Link>。</p>
      </form>
    </section>
  );
}
