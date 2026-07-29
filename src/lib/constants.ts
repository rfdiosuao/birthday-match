export const celebrationStyles = ["quiet", "explore", "lively"] as const;
export const budgetLevels = ["under_100", "100_300", "300_600", "flexible"] as const;
export const groupSizes = ["two", "small", "medium"] as const;
export const genderOptions = ["woman", "man", "nonbinary", "private"] as const;
export const groupPreferences = ["any", "women_only", "men_only"] as const;
export const contactKinds = ["wechat", "email", "phone"] as const;
export const activityOptions = [
  "meal",
  "cake",
  "walk",
  "photo",
  "museum",
  "workshop",
  "outdoor",
  "live_music",
] as const;

export const labels = {
  celebrationStyle: {
    quiet: "安静聊聊",
    explore: "一起探索城市",
    lively: "热闹庆祝",
  },
  budgetLevel: {
    under_100: "100 元以内",
    "100_300": "100—300 元",
    "300_600": "300—600 元",
    flexible: "预算可商量",
  },
  groupSize: {
    two: "两个人",
    small: "3—4 人",
    medium: "5—6 人",
  },
  gender: {
    woman: "女性",
    man: "男性",
    nonbinary: "非二元性别",
    private: "不公开",
  },
  groupPreference: {
    any: "不限性别",
    women_only: "仅女性",
    men_only: "仅男性",
  },
  contactKind: {
    wechat: "微信",
    email: "邮箱",
    phone: "手机号",
  },
  activity: {
    meal: "生日餐",
    cake: "吃蛋糕",
    walk: "城市散步",
    photo: "拍照",
    museum: "看展",
    workshop: "手作体验",
    outdoor: "户外活动",
    live_music: "现场演出",
  },
} as const;
