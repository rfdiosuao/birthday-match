import type { Metadata } from "next";
import { SupportForm } from "@/components/support-form";

export const metadata: Metadata = { title: "联系客服" };

export default function SupportPage() {
  return (
    <main id="main-content" className="support-page">
      <header>
        <p className="kicker">站内客服</p>
        <h1>遇到问题，<br />把情况告诉我们<span>.</span></h1>
        <p>账号恢复、安全举报、隐私请求都可以在这里提交。请不要填写密码、验证码、身份证号码或银行卡信息。</p>
      </header>
      <SupportForm />
    </main>
  );
}
