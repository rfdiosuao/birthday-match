import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "隐私政策" };

export default function PrivacyPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  return (
    <LegalPage title="隐私政策" updated="2026 年 7 月 31 日">
      <section>
        <h2>我们收集什么</h2>
        <p>为完成注册和匹配，我们处理登录邮箱、昵称、生日的月和日、城市、自我介绍、庆祝偏好、性别与小组偏好、联系方式，以及你作出的匹配选择和举报信息。我们不要求填写出生年份、身份证号码或精确住址。</p>
      </section>
      <section>
        <h2>为什么使用这些信息</h2>
        <p>生日和城市用于确定候选范围；庆祝方式、预算、人数与活动偏好用于计算匹配度；性别与小组偏好用于执行双方兼容的安全筛选；联系方式仅用于双向匹配成功后的联系。</p>
      </section>
      <section>
        <h2>谁能看到</h2>
        <p>候选人可以看到你的昵称、城市、自我介绍、生日月日和庆祝偏好，但看不到登录邮箱与联系方式。只有双方都选择“想一起过”后，系统才向彼此开放档案中填写的联系方式。</p>
      </section>
      <section>
        <h2>保存和安全</h2>
        <p>账号、档案和匹配信息存储在我们的自建服务器数据库中，并通过服务端权限检查限制访问。我们仅在提供服务、处理安全事件和履行法定义务所需的期限内保存信息。</p>
      </section>
      <section>
        <h2>你的权利</h2>
        <p>你可以随时修改或暂停档案，停止接收新候选人。你也可以申请访问、更正或删除个人信息。删除账号后，法律没有要求继续保存的数据将被删除或匿名化。</p>
      </section>
      <section>
        <h2>联系我们</h2>
        <p>{supportEmail ? <>隐私请求与安全问题请发送至 <a href={`mailto:${supportEmail}`}>{supportEmail}</a>，也可以使用 <Link href="/support">站内客服表单</Link>。</> : <>隐私请求、安全问题和账号恢复，请使用 <Link href="/support">站内客服表单</Link>，运营人员会在后台处理。</>}</p>
      </section>
    </LegalPage>
  );
}
