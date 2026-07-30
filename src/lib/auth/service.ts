import { credentialsSchema, hashPassword, verifyPassword } from "./credentials";

export interface AuthUser {
  id: string;
  email: string;
  passwordHash: string;
}

export interface AuthUserRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
  create(email: string, passwordHash: string): Promise<AuthUser>;
}

export class AuthServiceError extends Error {
  constructor(public readonly code: "email_exists" | "invalid_credentials" | "invalid_input") {
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
  return repository.create(parsed.data.email, passwordHash);
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
  return user;
}
