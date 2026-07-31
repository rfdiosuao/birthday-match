import type { Activity, CelebrationStyle } from "./types";

export interface BirthdayVisual {
  src: string;
  alt: string;
  note: string;
}

const inspirationNote = "庆祝场景灵感 · AI 生成，非用户照片";

export const birthdayVisuals = {
  midnightCake: {
    src: "/birthday/01-midnight-cake.webp",
    alt: "黑色桌面上的巧克力生日蛋糕点着一支蜡烛，红色丝带环绕在旁边",
    note: inspirationNote,
  },
  morningWish: {
    src: "/birthday/02-morning-wish.webp",
    alt: "清晨阳光下，一位女生在草莓蛋糕前安静许愿，桌边摆着红色礼物",
    note: inspirationNote,
  },
  rooftopFireworks: {
    src: "/birthday/03-rooftop-fireworks.webp",
    alt: "城市屋顶上两个人围着生日蛋糕聊天，远处的夜空正绽放烟花",
    note: inspirationNote,
  },
  friendsToast: {
    src: "/birthday/04-friends-toast.webp",
    alt: "不同肤色的朋友们举起红色和透明汽水杯，在生日餐桌上碰杯庆祝",
    note: inspirationNote,
  },
  dinnerForTwo: {
    src: "/birthday/05-dinner-for-two.webp",
    alt: "烛光下为两个人准备的生日餐桌，中间摆着蛋糕和红色鲜花",
    note: inspirationNote,
  },
  parkPicnic: {
    src: "/birthday/06-park-picnic.webp",
    alt: "城市公园的草地上，两个人戴着纸皇冠坐在野餐布前捧着生日蛋糕",
    note: inspirationNote,
  },
  rainySelfCelebration: {
    src: "/birthday/07-rainy-self-celebration.webp",
    alt: "雨夜窗边，一位男生读书陪自己过生日，桌上有小蛋糕和红色杯子",
    note: inspirationNote,
  },
  karaokeConfetti: {
    src: "/birthday/08-karaoke-confetti.webp",
    alt: "卡拉 OK 房间里朋友们围着麦克风大笑，红色彩带和纸屑在空中飞舞",
    note: inspirationNote,
  },
  museumGift: {
    src: "/birthday/09-museum-gift.webp",
    alt: "两位朋友在当代美术馆里散步，其中一人把红色礼物藏在身后",
    note: inspirationNote,
  },
  cityCakeWalk: {
    src: "/birthday/10-city-cake-walk.webp",
    alt: "夕阳下两个人穿过城市街道，其中一人抱着系有红色丝带的蛋糕盒",
    note: inspirationNote,
  },
  potteryParty: {
    src: "/birthday/11-pottery-party.webp",
    alt: "三位朋友在陶艺工作室一起做杯子，桌中央摆着点亮红蜡烛的小蛋糕",
    note: inspirationNote,
  },
  beachSunrise: {
    src: "/birthday/12-beach-sunrise.webp",
    alt: "日出海滩的野餐布上摆着白色生日蛋糕、两双鞋和两只保温杯",
    note: inspirationNote,
  },
  partyHats: {
    src: "/birthday/13-party-hats.webp",
    alt: "红色、黑色和米白色纸质生日帽与樱桃、丝带组成的俯拍静物",
    note: inspirationNote,
  },
  wrappedGift: {
    src: "/birthday/14-wrapped-gift.webp",
    alt: "米白礼物盒系着宽大的红色蝴蝶结，旁边放着空白卡片和黑色蜡烛",
    note: inspirationNote,
  },
  candleLine: {
    src: "/birthday/15-candle-line.webp",
    alt: "黑色背景前一排高低不同的红色和米白色生日蜡烛正在燃烧",
    note: inspirationNote,
  },
  confettiShadows: {
    src: "/birthday/16-confetti-shadows.webp",
    alt: "阳光照在米白墙面，红色丝带和金色纸屑投下活泼的庆祝阴影",
    note: inspirationNote,
  },
  redBalloons: {
    src: "/birthday/17-red-balloons.webp",
    alt: "黑色墙面前漂浮着红色和米白色气球，长长的红色彩带垂落下来",
    note: inspirationNote,
  },
  dessertShop: {
    src: "/birthday/18-dessert-shop.webp",
    alt: "雨夜甜品店的窗边，两位朋友在暖光里分享点着蜡烛的小蛋糕",
    note: inspirationNote,
  },
  twoCakesMatch: {
    src: "/birthday/19-two-cakes-match.webp",
    alt: "黑色桌面上巧克力蛋糕和草莓蛋糕并排摆放，两支红蜡烛向彼此倾斜",
    note: inspirationNote,
  },
  longTableDinner: {
    src: "/birthday/20-long-table-dinner.webp",
    alt: "公共餐厅的长桌边坐满正在分享蛋糕、交谈大笑的成年朋友",
    note: inspirationNote,
  },
} as const satisfies Record<string, BirthdayVisual>;

export const birthdayVisualList: BirthdayVisual[] = Object.values(birthdayVisuals);

const activityVisuals: Partial<Record<Activity, BirthdayVisual>> = {
  meal: birthdayVisuals.dinnerForTwo,
  cake: birthdayVisuals.friendsToast,
  walk: birthdayVisuals.cityCakeWalk,
  photo: birthdayVisuals.rooftopFireworks,
  museum: birthdayVisuals.museumGift,
  workshop: birthdayVisuals.potteryParty,
  outdoor: birthdayVisuals.beachSunrise,
  live_music: birthdayVisuals.karaokeConfetti,
};

const styleVisuals: Record<CelebrationStyle, readonly BirthdayVisual[]> = {
  quiet: [
    birthdayVisuals.rainySelfCelebration,
    birthdayVisuals.dessertShop,
    birthdayVisuals.dinnerForTwo,
  ],
  explore: [
    birthdayVisuals.cityCakeWalk,
    birthdayVisuals.museumGift,
    birthdayVisuals.parkPicnic,
  ],
  lively: [
    birthdayVisuals.karaokeConfetti,
    birthdayVisuals.friendsToast,
    birthdayVisuals.longTableDinner,
  ],
};

export function visualForCandidate(
  candidate: {
    id: string;
    celebration_style: CelebrationStyle;
    activities: readonly Activity[];
  },
) {
  const activityMatch = candidate.activities
    .map((activity) => activityVisuals[activity])
    .find((visual): visual is BirthdayVisual => Boolean(visual));
  if (activityMatch) return activityMatch;

  const choices = styleVisuals[candidate.celebration_style];
  return choices[stableIndex(candidate.id, choices.length)];
}

function stableIndex(value: string, length: number) {
  let hash = 0;
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return hash % length;
}
