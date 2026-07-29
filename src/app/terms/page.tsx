import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "用户协议" };

export default function TermsPage() {
  return (
    <LegalPage title="用户协议" updated="2026 年 7 月 27 日">
      <section>
        <h2>使用资格</h2>
        <p>目前仅向年满 18 周岁的用户开放。你应使用本人可正常接收邮件的邮箱注册，并保证档案信息真实、不冒用他人身份。</p>
      </section>
      <section>
        <h2>平台提供什么</h2>
        <p>平台依据生日月日、城市和庆祝偏好提供候选人排序与双向匹配功能。匹配度只表示档案信息的相似程度，不代表平台对任何人的身份、品行或线下活动作出担保。</p>
      </section>
      <section>
        <h2>禁止行为</h2>
        <p>不得骚扰、歧视、跟踪或威胁他人；不得发布虚假信息、广告或违法内容；不得要求他人转账、提供验证码或敏感身份信息；不得绕过双向同意机制收集联系方式。</p>
      </section>
      <section>
        <h2>线下活动</h2>
        <p>用户自行决定是否见面并对个人选择负责。首次见面应选择公共场所，提前向可信任的人告知行程，并保留随时结束活动的权利。发生现实危险时，应优先联系当地紧急服务。</p>
      </section>
      <section>
        <h2>举报与处置</h2>
        <p>我们可以依据举报、安全风险或违反本协议的行为，限制档案展示、暂停或终止账号。为保护举报人，被举报者不会看到举报人的身份和具体举报内容。</p>
      </section>
      <section>
        <h2>服务变更</h2>
        <p>在不损害用户基本权利的前提下，我们可能调整匹配规则和功能。涉及个人信息处理方式的重要变化，将通过页面提示或注册邮箱告知。</p>
      </section>
    </LegalPage>
  );
}
