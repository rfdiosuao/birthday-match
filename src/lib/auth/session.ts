import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRepository } from "../data/client";
import { createSessionToken, hashSessionToken } from "./credentials";
import { createSessionCookieOptions, SESSION_TTL_SECONDS } from "./session-config";

export const SESSION_COOKIE_NAME = "birthday_session";

export interface SessionUser {
  id: string;
  email: string;
  role: "user" | "admin";
}

export async function createSession(userId: string) {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await getRepository().createSession(userId, tokenHash, expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    createSessionCookieOptions(process.env.NODE_ENV === "production"),
  );
}

export async function getOptionalUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return getRepository().findSessionUser(hashSessionToken(token));
}

export async function requireUser() {
  const user = await getOptionalUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) await getRepository().deleteSession(hashSessionToken(token));

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...createSessionCookieOptions(process.env.NODE_ENV === "production"),
    maxAge: 0,
  });
}
