import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Link className="footer-brand" href="/">今年我想好好过生日<span>.</span></Link>
        <p>让每一个想认真度过的生日，都有被回应的可能。</p>
      </div>
      <nav aria-label="页脚导航">
        <Link href="/safety">安全守则</Link>
        <Link href="/privacy">隐私政策</Link>
        <Link href="/terms">用户协议</Link>
      </nav>
      <p className="footer-year">© {new Date().getFullYear()}</p>
    </footer>
  );
}
