import Link from "next/link";
import { getOptionalUser } from "@/lib/auth/session";
import { LogoutButton } from "./logout-button";

export async function SiteHeader() {
  const user = await getOptionalUser();

  return (
    <header className="site-header">
      <Link className="site-brand" href="/" aria-label="今年我想好好过生日首页">
        <span className="brand-full">今年我想好好过生日</span>
        <span className="brand-short">好好过生日</span>
        <i>.</i>
      </Link>
      <nav className="site-nav" aria-label="主要导航">
        {user ? (
          <>
            <Link href="/matches">找同日的人</Link>
            <Link href="/connections">已匹配</Link>
            <Link href="/onboarding">我的档案</Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/#how">匹配方式</Link>
            <Link href="/safety">安全守则</Link>
            <Link className="header-action" href="/login">开始匹配</Link>
          </>
        )}
      </nav>
    </header>
  );
}
