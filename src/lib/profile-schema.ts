import { z } from "zod";
import {
  activityOptions,
  budgetLevels,
  celebrationStyles,
  contactKinds,
  genderOptions,
  groupPreferences,
  groupSizes,
} from "./constants";

function isValidBirthday(month: number, day: number) {
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= new Date(2024, month, 0).getDate();
}

export const profileSchema = z
  .object({
    nickname: z.string().trim().min(2, "称呼至少需要 2 个字").max(20, "称呼不能超过 20 个字"),
    birthdayMonth: z.coerce.number().int(),
    birthdayDay: z.coerce.number().int(),
    city: z.string().trim().min(2, "请填写所在城市").max(30, "城市名称过长"),
    bio: z.string().trim().min(20, "请至少用 20 个字介绍自己").max(160, "自我介绍不能超过 160 个字"),
    celebrationStyle: z.enum(celebrationStyles),
    budgetLevel: z.enum(budgetLevels),
    groupSize: z.enum(groupSizes),
    gender: z.enum(genderOptions),
    groupPreference: z.enum(groupPreferences),
    activities: z.array(z.enum(activityOptions)).min(1, "至少选择一项想做的事").max(5, "最多选择五项"),
    contactKind: z.enum(contactKinds),
    contactValue: z.string().trim().min(3, "请填写有效的联系方式").max(80, "联系方式过长"),
    isAdult: z.literal(true, { error: "目前仅向年满 18 周岁的用户开放" }),
    safetyAccepted: z.literal(true, { error: "请先同意安全守则" }),
    visibility: z.enum(["active", "paused"]).default("active"),
  })
  .superRefine((value, context) => {
    if (!isValidBirthday(value.birthdayMonth, value.birthdayDay)) {
      context.addIssue({
        code: "custom",
        path: ["birthdayDay"],
        message: "请选择有效的生日日期",
      });
    }

    if (value.contactKind === "email" && !z.email().safeParse(value.contactValue).success) {
      context.addIssue({
        code: "custom",
        path: ["contactValue"],
        message: "请填写有效的邮箱地址",
      });
    }

    if (value.groupPreference === "women_only" && value.gender !== "woman") {
      context.addIssue({
        code: "custom",
        path: ["groupPreference"],
        message: "仅女性小组目前只对自我认同为女性的用户开放",
      });
    }

    if (value.groupPreference === "men_only" && value.gender !== "man") {
      context.addIssue({
        code: "custom",
        path: ["groupPreference"],
        message: "仅男性小组目前只对自我认同为男性的用户开放",
      });
    }
  });

export type ProfileInput = z.input<typeof profileSchema>;
export type ValidProfileInput = z.output<typeof profileSchema>;

export const reactionSchema = z.object({
  targetId: z.uuid(),
  decision: z.enum(["interested", "pass"]),
});

export const reportSchema = z.object({
  targetId: z.uuid(),
  reason: z.enum(["harassment", "false_information", "unsafe_behavior", "spam", "other"]),
  details: z.string().trim().max(500).default(""),
});
