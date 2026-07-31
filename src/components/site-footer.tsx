import Image from "next/image";
import Link from "next/link";
import { birthdayVisuals } from "@/lib/birthday-visuals";

export function SiteFooter() {
  return (
    <>
      <aside className="footer-celebration" aria-label="生日庆祝场景">
        {[birthdayVisuals.partyHats, birthdayVisuals.candleLine, birthdayVisuals.confettiShadows].map(
          (visual, index) => (
            <figure key={visual.src}>
              <Image
                src={visual.src}
                alt={visual.alt}
                fill
                sizes="(max-width: 760px) 100vw, 33vw"
              />
              <figcaption>{index === 0 ? "戴上纸皇冠" : index === 1 ? "点亮生日蜡烛" : "把纸屑留给快乐"}</figcaption>
            </figure>
          ),
        )}
      </aside>
      <footer className="site-footer">
        <div>
          <Link className="footer-brand" href="/">今年我想好好过生日<span>.</span></Link>
          <p>让每一个想认真度过的生日，都有被回应的可能。</p>
        </div>
        <nav aria-label="页脚导航">
          <Link href="/safety">安全守则</Link>
          <Link href="/privacy">隐私政策</Link>
          <Link href="/terms">用户协议</Link>
          <Link href="/support">联系客服</Link>
        </nav>
        <p className="footer-year">© {new Date().getFullYear()}</p>
      </footer>
    </>
  );
}
