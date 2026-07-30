import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, LockKeyhole, MapPin, Users } from "lucide-react";
import { getOptionalUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function todayInShanghai() {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: "Asia/Shanghai",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { year: value.year, month: value.month, day: value.day };
}

export default async function HomePage() {
  const user = await getOptionalUser();
  const today = todayInShanghai();
  const primaryHref = user ? "/matches" : "/login";
  const primaryLabel = user ? "查看今天的候选人" : "找到同一天的人";

  return (
    <main id="main-content">
      <section className="home-hero">
        <div className="hero-message">
          <p className="kicker">为今年想认真过生日的人</p>
          <h1>今年，我想<br />好好过生日<span>.</span></h1>
          <p className="hero-lead">
            找到同一座城市、同一天生日，也期待相似庆祝方式的人。双方都愿意以后，再交换联系方式。
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href={primaryHref}>
              {primaryLabel}<ArrowRight aria-hidden="true" size={18} />
            </Link>
            <Link className="text-link" href="#how">匹配是怎样发生的</Link>
          </div>
        </div>
        <div className="hero-date" aria-label={`今天是 ${today.month} 月 ${today.day} 日`}>
          <div className="date-meta"><span>{today.year}</span><span>同一天 · 同一座城</span></div>
          <div className="date-display"><strong>{today.month}</strong><i>/</i><strong>{today.day}</strong></div>
          <div className="date-caption"><span>今天过生日的人，<br />也许正在等一个邀请。</span><b>01</b></div>
        </div>
      </section>

      <section className="birthday-poster-wall" aria-labelledby="birthday-poster-title">
        <article className="birthday-poster birthday-poster-primary">
          <Image
            className="birthday-poster-image"
            src="/posters/birthday-midnight.webp"
            alt=""
            fill
            sizes="100vw"
          />
          <div className="birthday-poster-scrim" aria-hidden="true" />
          <p className="birthday-poster-mark"><span>HAPPY</span> BIRTHDAY / TODAY</p>
          <div className="birthday-poster-copy">
            <p className="kicker">既然你点进来了</p>
            <h2 id="birthday-poster-title">
              那么你应该是<br /><span>今天生日吧.</span>
            </h2>
            <p>
              不管有没有人陪你过生日，<br />
              <strong>你今天一定要快乐哦。</strong>
            </p>
            <Link className="button birthday-poster-action" href={primaryHref}>
              {user ? "看看谁也在等你" : "给今天一个邀请"}<ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
          <p className="birthday-poster-note" aria-hidden="true">MAKE A WISH · 吹蜡烛之前，先许一个愿望</p>
        </article>

        <div className="birthday-poster-pair">
          <figure className="birthday-poster birthday-poster-morning">
            <Image
              className="birthday-poster-image"
              src="/posters/birthday-morning.webp"
              alt="清晨阳光照进房间，桌上放着草莓蛋糕、红色礼物和一朵花"
              fill
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <figcaption>
              <span>08:00 / 新的一岁</span>
              <strong>先从好好爱自己开始。</strong>
            </figcaption>
          </figure>
          <figure className="birthday-poster birthday-poster-fireworks">
            <Image
              className="birthday-poster-image"
              src="/posters/birthday-fireworks.webp"
              alt="夜晚的屋顶上摆着一块生日蛋糕，远处烟花正在绽放"
              fill
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <figcaption>
              <span>23:59 / 今天结束以前</span>
              <strong>请记得为自己庆祝。</strong>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="origin-section">
        <span className="section-number">02</span>
        <div>
          <p className="kicker">为什么做这件事</p>
          <h2>没有人来庆祝，<br />不代表没有人愿意陪你。</h2>
          <p className="large-copy">
            朋友可能忘了日期，也可能那天过得并不好。但生日这一天，我们仍然值得被认真对待。
            这个网站把同一天生日、也想有人陪伴的人连接起来。
          </p>
        </div>
      </section>

      <section className="how-section" id="how">
        <div className="section-title">
          <p className="kicker">匹配机制</p>
          <h2>不是随机拼桌，<br />是两个人都愿意。</h2>
        </div>
        <ol className="mechanism-grid">
          <li>
            <span>01</span>
            <MapPin aria-hidden="true" />
            <h3>先对上生日与城市</h3>
            <p>只有同城、同月同日生日，且小组性别偏好彼此兼容的人会进入候选。</p>
          </li>
          <li>
            <span>02</span>
            <Users aria-hidden="true" />
            <h3>再比较庆祝偏好</h3>
            <p>庆祝方式、预算、人数和共同想做的事，会共同构成匹配度。</p>
          </li>
          <li>
            <span>03</span>
            <LockKeyhole aria-hidden="true" />
            <h3>双向同意才建立联系</h3>
            <p>候选阶段不展示联系方式。只有双方都点“想一起过”，联系方式才会互相开放。</p>
          </li>
        </ol>
      </section>

      <section className="privacy-section">
        <div>
          <p className="kicker">从第一次见面开始保护边界</p>
          <h2>先安全，<br />再认识彼此。</h2>
        </div>
        <ul className="rule-list">
          <li><Check aria-hidden="true" /><span><strong>年满 18 周岁</strong>目前只开放成年用户注册。</span></li>
          <li><Check aria-hidden="true" /><span><strong>联系方式不公开</strong>双向同意前，其他人无法读取。</span></li>
          <li><Check aria-hidden="true" /><span><strong>公共场所见面</strong>首次活动不安排在私人住所。</span></li>
          <li><Check aria-hidden="true" /><span><strong>可以随时退出</strong>拒绝、暂停档案或举报都不需要解释。</span></li>
        </ul>
      </section>

      <section className="home-cta">
        <p className="section-number">05</p>
        <h2>下一次生日，<br />别一个人等<span>.</span></h2>
        <Link className="button button-inverse" href={primaryHref}>{primaryLabel}<ArrowRight aria-hidden="true" size={18} /></Link>
      </section>
    </main>
  );
}
