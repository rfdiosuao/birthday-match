import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getOptionalUser } from "@/lib/auth/session";
import { birthdayVisuals } from "@/lib/birthday-visuals";

export const metadata: Metadata = { title: "登录" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getOptionalUser();
  if (user) redirect("/matches");

  return (
    <main id="main-content" className="auth-page">
      <section className="auth-message">
        <Image
          className="auth-message-image"
          src={birthdayVisuals.redBalloons.src}
          alt={birthdayVisuals.redBalloons.alt}
          fill
          priority
          sizes="(max-width: 1080px) 100vw, 50vw"
        />
        <div className="auth-message-scrim" aria-hidden="true" />
        <div className="auth-message-content">
          <p className="kicker">开始之前</p>
          <h1>先确认，<br />这是你<span>.</span></h1>
          <p>账号和资料都保存在我们的服务器中。使用邮箱和密码登录，不再依赖外部邮件链接。</p>
          <div className="auth-message-bottom">
            <div className="auth-date" aria-hidden="true">MM<span>/</span>DD</div>
            <figure className="auth-gift">
              <Image
                src={birthdayVisuals.wrappedGift.src}
                alt={birthdayVisuals.wrappedGift.alt}
                fill
                sizes="180px"
              />
            </figure>
          </div>
        </div>
      </section>
      <LoginForm />
    </main>
  );
}
