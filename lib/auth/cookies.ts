export const ACCESS_TOKEN_COOKIE = "nexone_access_token";
export const REFRESH_TOKEN_COOKIE = "nexone_refresh_token";
export const PERSONA_COOKIE = "nexone_mock_persona";

export const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const PERSONA_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr =
      typeof atob === "function"
        ? atob(payloadBase64)
        : Buffer.from(payloadBase64, "base64").toString("utf-8");
    return JSON.parse(jsonStr) as T;
  } catch {
    return null;
  }
}

export function decodeJwtExpiry(token: string): number | null {
  const payload = decodeJwtPayload<{ exp?: number }>(token);
  return payload?.exp ?? null;
}

export function isTokenExpired(token: string, bufferSeconds = 30): boolean {
  const exp = decodeJwtExpiry(token);
  if (!exp) return true;
  return Date.now() >= (exp - bufferSeconds) * 1000;
}

export function createMockJwt(
  payload: Record<string, unknown>,
  expiresInSeconds: number = 3600
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const encodeBase64Url = (obj: unknown) => {
    const str = JSON.stringify(obj);
    const b64 =
      typeof btoa === "function"
        ? btoa(str)
        : Buffer.from(str, "utf-8").toString("base64");
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const headerB64 = encodeBase64Url(header);
  const payloadB64 = encodeBase64Url(fullPayload);
  const sigB64 = encodeBase64Url({ sig: "mock_signature" });

  return `${headerB64}.${payloadB64}.${sigB64}`;
}
