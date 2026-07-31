import { credentialsSchema, hashPassword, verifyPassword } from "./credentials";

export interface AuthUser {
  id: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  status: "active" | "banned";
}

export interface AuthUserRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
  create(email: string, passwordHash: string): Promise<AuthUser>;
}

export class AuthServiceError extends Error {
  constructor(public readonly code: "email_exists" | "invalid_credentials" | "invalid_input" | "account_disabled") {
    super(code);
  }
}

const dummyPasswordHash = hashPassword("not-a-real-user-password");

export async function registerUser(
  repository: AuthUserRepository,
  input: unknown,
): Promise<AuthUser> {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) throw new AuthServiceError("invalid_input");

  const passwordHash = await hashPassword(parsed.data.password);
  try {
    return await repository.create(parsed.data.email, passwordHash);
  } catch (error) {
    if (isRepositoryEmailConflict(error)) throw new AuthServiceError("email_exists");
    throw error;
  }
}

export async function authenticateUser(
  repository: AuthUserRepository,
  input: unknown,
): Promise<AuthUser> {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) throw new AuthServiceError("invalid_credentials");

  const user = await repository.findByEmail(parsed.data.email);
  const passwordHash = user?.passwordHash || (await dummyPasswordHash);
  const passwordMatches = await verifyPassword(parsed.data.password, passwordHash);

  if (!user || !passwordMatches) throw new AuthServiceError("invalid_credentials");
  if (user.status === "banned") throw new AuthServiceError("account_disabled");
  return user;
}

function isRepositoryEmailConflict(error: unknown) {
  return typeof error === "object"
    && error !== null
    && "code" in error
    && error.code === "email_exists";
}
