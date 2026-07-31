import { describe, expect, it } from "vitest";
import { authenticateUser, AuthServiceError, registerUser, type AuthUser, type AuthUserRepository } from "./service";

function createRepository(): AuthUserRepository & { users: AuthUser[] } {
  const users: AuthUser[] = [];

  return {
    users,
    async findByEmail(email) {
      return users.find((user) => user.email === email) || null;
    },
    async create(email, passwordHash) {
      if (users.some((user) => user.email === email)) {
        throw Object.assign(new Error("repository email conflict"), { code: "email_exists" });
      }
      const user: AuthUser = {
        id: crypto.randomUUID(),
        email,
        passwordHash,
        role: "user",
        status: "active",
      };
      users.push(user);
      return user;
    },
  };
}

describe("registration", () => {
  it("normalizes the email and stores only a password hash", async () => {
    const repository = createRepository();

    const user = await registerUser(repository, {
      email: "  Birthday@Example.COM ",
      password: "a-secure-password",
    });

    expect(user.email).toBe("birthday@example.com");
    expect(user.passwordHash).not.toContain("a-secure-password");
  });

  it("rejects an existing email address", async () => {
    const repository = createRepository();
    const credentials = { email: "birthday@example.com", password: "a-secure-password" };

    await registerUser(repository, credentials);

    await expect(registerUser(repository, credentials)).rejects.toBeInstanceOf(AuthServiceError);
    await expect(registerUser(repository, credentials)).rejects.toMatchObject({ code: "email_exists" });
  });
});

describe("authentication", () => {
  it("returns the user for a correct password", async () => {
    const repository = createRepository();
    const registered = await registerUser(repository, {
      email: "birthday@example.com",
      password: "a-secure-password",
    });

    const authenticated = await authenticateUser(repository, {
      email: "BIRTHDAY@example.com",
      password: "a-secure-password",
    });

    expect(authenticated.id).toBe(registered.id);
  });

  it("uses the same generic error for an unknown email and a wrong password", async () => {
    const repository = createRepository();
    await registerUser(repository, {
      email: "birthday@example.com",
      password: "a-secure-password",
    });

    await expect(
      authenticateUser(repository, {
        email: "birthday@example.com",
        password: "wrong-password",
      }),
    ).rejects.toMatchObject({ code: "invalid_credentials" });

    await expect(
      authenticateUser(repository, {
        email: "missing@example.com",
        password: "wrong-password",
      }),
    ).rejects.toMatchObject({ code: "invalid_credentials" });
  });

  it("rejects a banned account even when the password is correct", async () => {
    const repository = createRepository();
    const registered = await registerUser(repository, {
      email: "blocked@example.com",
      password: "a-secure-password",
    });
    Object.assign(registered, { status: "banned" });

    await expect(
      authenticateUser(repository, {
        email: "blocked@example.com",
        password: "a-secure-password",
      }),
    ).rejects.toMatchObject({ code: "account_disabled" });
  });
});
