import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { birthdayVisuals } from "@/lib/birthday-visuals";

const moments = [
  {
    visual: birthdayVisuals.longTableDinner,
    time: "19:30",
    copy: "把愿望放到一张有人回应的长桌上。",
    className: "moment-feature",
  },
  {
    visual: birthdayVisuals.morningWish,
    time: "08:00",
    copy: "新一岁，先认真喜欢自己。",
    className: "moment-tall",
  },
  {
    visual: birthdayVisuals.friendsToast,
    time: "20:16",
    copy: "认识不久，也可以真诚碰杯。",
    className: "moment-square",
  },
  {
    visual: birthdayVisuals.museumGift,
    time: "14:20",
    copy: "看一场展，也藏一份小惊喜。",
    className: "moment-wide",
  },
  {
    visual: birthdayVisuals.parkPicnic,
    time: "16:40",
    copy: "草地、单车、纸皇冠，足够庆祝。",
    className: "moment-wide",
  },
  {
    visual: birthdayVisuals.potteryParty,
    time: "15:10",
    copy: "一起做点什么，也把今天留下来。",
    className: "moment-square",
  },
  {
    visual: birthdayVisuals.beachSunrise,
    time: "06:12",
    copy: "在太阳升起来时，迎接新的一岁。",
    className: "moment-wide",
  },
  {
    visual: birthdayVisuals.dessertShop,
    time: "21:45",
    copy: "雨夜里，也有一扇为你亮着的窗。",
    className: "moment-wide",
  },
  {
    visual: birthdayVisuals.rooftopFireworks,
    time: "23:20",
    copy: "今天结束以前，再许一个愿望。",
    className: "moment-wide",
  },
  {
    visual: birthdayVisuals.midnightCake,
    time: "00:00",
    copy: "蜡烛很小，但新的一岁已经开始。",
    className: "moment-square",
  },
] as const;

export function BirthdayMoments({ href }: { href: string }) {
  return (
    <section className="birthday-moments" aria-labelledby="birthday-moments-title">
      <header className="birthday-moments-heading">
        <div>
          <p className="kicker">20 张生日场景 · 这一页先放 10 个时刻</p>
          <h2 id="birthday-moments-title">生日不只有一种<br />正确的过法<span>.</span></h2>
        </div>
        <p>
          可以热闹，可以安静；可以去看展、吹海风、做一只杯子，也可以只找一个愿意坐下来听你说话的人。
        </p>
      </header>

      <div className="birthday-moments-grid">
        {moments.map(({ visual, time, copy, className }) => (
          <figure className={`birthday-moment ${className}`} key={visual.src}>
            <Image
              src={visual.src}
              alt={visual.alt}
              fill
              sizes="(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="birthday-moment-scrim" aria-hidden="true" />
            <figcaption>
              <span>{time}</span>
              <strong>{copy}</strong>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="birthday-moments-cta">
        <p>你不需要先拥有一群朋友，才有资格认真庆祝。</p>
        <Link className="button button-primary" href={href}>
          找到同一天的人<ArrowRight aria-hidden="true" size={18} />
        </Link>
      </div>
    </section>
  );
}
