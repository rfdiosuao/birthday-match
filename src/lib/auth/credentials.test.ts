import { describe, expect, it } from "vitest";
import {
  credentialsSchema,
  createSessionToken,
  hashPassword,
  hashSessionToken,
  normalizeEmail,
  verifyPassword,
} from "./credentials";

describe("credential validation", () => {
  it("normalizes email addresses before storage", () => {
    expect(normalizeEmail("  Birthday.User@Example.COM ")).toBe("birthday.user@example.com");
  });

  it("accepts a valid email and password", () => {
    expect(
      credentialsSchema.safeParse({
        email: "birthday@example.com",
        password: "a-secure-password",
      }).success,
    ).toBe(true);
  });

  it("rejects passwords shorter than eight characters", () => {
    expect(
      credentialsSchema.safeParse({
        email: "birthday@example.com",
        password: "short",
      }).success,
    ).toBe(false);
  });
});

describe("password storage", () => {
  it("stores a salted hash and verifies only the correct password", async () => {
    const encoded = await hashPassword("a-secure-password");

    expect(encoded).not.toContain("a-secure-password");
    await expect(verifyPassword("a-secure-password", encoded)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", encoded)).resolves.toBe(false);
  });
});

describe("session tokens", () => {
  it("creates an opaque token and stores only its deterministic digest", () => {
    const token = createSessionToken();
    const digest = hashSessionToken(token);

    expect(token.length).toBeGreaterThanOrEqual(40);
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(hashSessionToken(token)).toBe(digest);
    expect(digest).not.toContain(token);
  });
});
