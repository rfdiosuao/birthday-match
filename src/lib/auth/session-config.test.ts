import { describe, expect, it } from "vitest";
import { createSessionCookieOptions, SESSION_TTL_SECONDS } from "./session-config";

describe("session cookie policy", () => {
  it("uses an HTTP-only, same-site cookie with a bounded lifetime", () => {
    expect(createSessionCookieOptions(false)).toEqual({
      httpOnly: true,
      maxAge: SESSION_TTL_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: false,
    });
  });

  it("requires HTTPS in production", () => {
    expect(createSessionCookieOptions(true).secure).toBe(true);
  });
});
