import { describe, expect, it } from "vitest";
import { orderedUserIds } from "./repository";

describe("matching transaction lock order", () => {
  it("orders both user ids consistently regardless of who reacts first", () => {
    expect(orderedUserIds("bbbb", "aaaa")).toEqual(["aaaa", "bbbb"]);
    expect(orderedUserIds("aaaa", "bbbb")).toEqual(["aaaa", "bbbb"]);
  });
});
