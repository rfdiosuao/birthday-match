import { describe, expect, it } from "vitest";
import { birthdayVisualList, visualForCandidate } from "./birthday-visuals";

describe("birthday visual library", () => {
  it("contains exactly twenty unique, accessible generated images", () => {
    expect(birthdayVisualList).toHaveLength(20);
    expect(new Set(birthdayVisualList.map((visual) => visual.src)).size).toBe(20);
    expect(
      birthdayVisualList.every(
        (visual) => visual.src.startsWith("/birthday/") && visual.alt.trim().length >= 8,
      ),
    ).toBe(true);
  });

  it("uses an activity-specific celebration image when possible", () => {
    expect(
      visualForCandidate({
        id: "candidate-one",
        celebration_style: "explore",
        activities: ["workshop", "meal"],
      }).src,
    ).toBe("/birthday/11-pottery-party.webp");
  });

  it("chooses a stable fallback without pretending it is a profile photo", () => {
    const candidate = {
      id: "candidate-two",
      celebration_style: "quiet" as const,
      activities: ["cake"] as const,
    };

    expect(visualForCandidate(candidate)).toEqual(visualForCandidate(candidate));
    expect(visualForCandidate(candidate).note).toContain("非用户照片");
  });
});
