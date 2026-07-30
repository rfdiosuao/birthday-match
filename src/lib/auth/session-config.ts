export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export function createSessionCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure: isProduction,
  };
}
