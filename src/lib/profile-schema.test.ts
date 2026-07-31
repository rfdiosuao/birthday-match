import { describe, expect, it } from "vitest";
import { displayCity, normalizeCity } from "./city";
import { profileSchema } from "./profile-schema";
import * as schemas from "./profile-schema";

const validProfile = {
  nickname: "认真过生日",
  birthdayMonth: 2,
  birthdayDay: 29,
  city: "杭州市",
  bio: "今年想认识几位同一天生日的人，一起吃饭散步，认真记录这一天。",
  celebrationStyle: "explore",
  budgetLevel: "100_300",
  groupSize: "small",
  gender: "woman",
  groupPreference: "women_only",
  activities: ["meal", "walk"],
  contactKind: "email",
  contactValue: "birthday@example.com",
  isAdult: true,
  safetyAccepted: true,
  visibility: "active",
};

describe("birthday profile validation", () => {
  it("accepts February 29 without collecting a birth year", () => {
    expect(profileSchema.safeParse(validProfile).success).toBe(true);
  });

  it("rejects impossible calendar dates", () => {
    expect(profileSchema.safeParse({ ...validProfile, birthdayDay: 30 }).success).toBe(false);
  });

  it("enforces gender-specific group eligibility", () => {
    expect(profileSchema.safeParse({ ...validProfile, gender: "man" }).success).toBe(false);
  });
});

describe("city normalization", () => {
  it("matches city names with or without an administrative suffix", () => {
    expect(normalizeCity(" 杭州市 ")).toBe(normalizeCity("杭州"));
    expect(displayCity(" 杭州市 ")).toBe("杭州市");
  });
});

describe("support request validation", () => {
  it("provides a schema for account recovery and safety requests", () => {
    const supportRequestSchema = Reflect.get(schemas, "supportRequestSchema");
    expect(supportRequestSchema).toBeDefined();
    expect(supportRequestSchema.safeParse({
      category: "account_recovery",
      email: "birthday@example.com",
      message: "我无法登录原来的账号，希望申请安全的账号恢复帮助。",
      website: "",
    }).success).toBe(true);
    expect(supportRequestSchema.safeParse({
      category: "general",
      email: "not-an-email",
      message: "太短",
      website: "",
    }).success).toBe(false);
  });
});
