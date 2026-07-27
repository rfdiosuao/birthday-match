import { describe, expect, it } from "vitest";
import { calculateCompatibility, sharedActivities } from "./matching";

const base = {
  celebrationStyle: "quiet" as const,
  budgetLevel: "100_300" as const,
  groupSize: "small" as const,
  activities: ["meal", "walk", "photo"] as const,
};

describe("matching score", () => {
  it("reaches 100 for strongly aligned profiles", () => {
    expect(calculateCompatibility(base, { ...base, activities: [...base.activities] })).toBe(100);
  });

  it("keeps a baseline for exact birthday and city candidates", () => {
    expect(
      calculateCompatibility(base, {
        celebrationStyle: "lively",
        budgetLevel: "under_100",
        groupSize: "two",
        activities: ["museum"],
      }),
    ).toBe(20);
  });

  it("treats flexible budget as compatible", () => {
    expect(
      calculateCompatibility(base, {
        ...base,
        budgetLevel: "flexible",
        activities: [],
      }),
    ).toBe(80);
  });

  it("returns only activities shared by both people", () => {
    expect(sharedActivities(["meal", "walk"], ["walk", "photo"])).toEqual(["walk"]);
  });
});
