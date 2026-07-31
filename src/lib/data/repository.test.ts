import { describe, expect, it } from "vitest";
import { AppRepository, orderedUserIds } from "./repository";

describe("matching transaction lock order", () => {
  it("orders both user ids consistently regardless of who reacts first", () => {
    expect(orderedUserIds("bbbb", "aaaa")).toEqual(["aaaa", "bbbb"]);
    expect(orderedUserIds("aaaa", "bbbb")).toEqual(["aaaa", "bbbb"]);
  });
});

describe("moderation operations", () => {
  it("exposes repository operations for support and report review", () => {
    expect(typeof Reflect.get(AppRepository.prototype, "createSupportRequest")).toBe("function");
    expect(typeof Reflect.get(AppRepository.prototype, "getAdminDashboard")).toBe("function");
    expect(typeof Reflect.get(AppRepository.prototype, "moderateReport")).toBe("function");
    expect(typeof Reflect.get(AppRepository.prototype, "resolveSupportRequest")).toBe("function");
  });
});
