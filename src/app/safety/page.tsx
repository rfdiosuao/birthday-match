import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "安全守则" };

export default function SafetyPage() {
  return (
    <LegalPage title="安全守则" updated="2026 年 7 月 27 日">
      <section>
        <h2>01 · 第一次见面只选公共场所</h2>
        <p>选择营业时间明确、人流稳定、交通便利的餐厅、商场、展馆或公园。不要把第一次见面安排在私人住所、酒店房间或偏僻地点。把见面地点和预计结束时间告诉一位可信任的人。</p>
      </section>
      <section>
        <h2>02 · 先确认边界，再确认行程</h2>
        <p>提前说清预算、活动内容、是否饮酒和大致结束时间。任何人都可以拒绝临时增加的项目、人员或消费，不需要为离开寻找理由。</p>
      </section>
      <section>
        <h2>03 · 不转账，不代付大额费用</h2>
        <p>不要在见面前向对方转账、购买票券或提供验证码。涉及订位时，优先选择可取消、可各自付款的方式。对方以生日、路费或紧急情况为由要求转账时，应立即停止联系。</p>
      </section>
      <section>
        <h2>04 · 保护住址和证件信息</h2>
        <p>不要分享精确住址、身份证照片、银行卡信息、工作门禁或家庭成员信息。联系方式只应用于确认生日活动，不代表你同意其他推销、追求或持续联系。</p>
      </section>
      <section>
        <h2>05 · 感到不对，就离开</h2>
        <p>如果对方冒犯、施压、尾随或让你感到不安全，立即结束活动并前往有人值守的地方。遇到现实危险时请联系警方 110；需要医疗帮助时请联系 120。之后可在候选页面提交举报与屏蔽。</p>
      </section>
    </LegalPage>
  );
}
