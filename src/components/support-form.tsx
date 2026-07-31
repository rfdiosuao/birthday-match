"use client";

import { FormEvent, useState } from "react";

export function SupportForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setLoading(true);
    setMessage("");
    setIsError(false);
    const form = new FormData(formElement);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.get("category"),
          email: form.get("email"),
          message: form.get("message"),
          website: form.get("website"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "提交失败，请稍后重试。");
      formElement.reset();
      setMessage("已经收到。运营人员会在后台查看并处理你的请求。");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "提交失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="support-form" onSubmit={submit}>
      <label className="field">
        <span>问题类型</span>
        <select name="category" defaultValue="account_recovery">
          <option value="account_recovery">账号无法登录或找回</option>
          <option value="safety">安全与举报问题</option>
          <option value="privacy">隐私与数据请求</option>
          <option value="general">其他问题</option>
        </select>
      </label>
      <label className="field">
        <span>联系邮箱</span>
        <input name="email" type="email" autoComplete="email" required maxLength={320} />
      </label>
      <label className="field">
        <span>具体情况</span>
        <textarea name="message" required minLength={20} maxLength={1000} rows={7} placeholder="请描述发生了什么、相关账号邮箱，以及希望我们如何帮助。" />
      </label>
      <label className="honeypot" aria-hidden="true">
        <span>Website</span><input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="button button-primary" type="submit" disabled={loading}>{loading ? "正在提交" : "提交请求"}</button>
      {message ? <p className={isError ? "form-message error" : "form-message"} role="status">{message}</p> : null}
    </form>
  );
}
