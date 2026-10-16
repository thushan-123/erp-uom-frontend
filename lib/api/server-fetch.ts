import { cookies } from "next/headers";
import { shouldMockPath, BACKEND_URL } from "./config";
import { ACCESS_TOKEN_COOKIE, PERSONA_COOKIE } from "@/lib/auth/cookies";
import { handleMockRequest } from "@/lib/mock";
import type { MockPersona } from "@/lib/types/navigation";

export interface FetchOptions {
  method?: string;
  query?: Record<string, string>;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function serverFetch<T = unknown>(
  pathname: string,
  options: FetchOptions = {}
): Promise<{ status: number; data: T }> {
  const method = options.method || "GET";
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const persona = (cookieStore.get(PERSONA_COOKIE)?.value || "admin") as MockPersona;

  if (shouldMockPath(pathname)) {
    const res = await handleMockRequest(
      method,
      pathname,
      options.query,
      options.body,
      persona
    );
    return res as { status: number; data: T };
  }

  // Real backend call
  const queryStr = options.query
    ? "?" + new URLSearchParams(options.query).toString()
    : "";
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const url = `${BACKEND_URL}${cleanPath}${queryStr}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (response.status === 204) {
    return { status: 204, data: null as unknown as T };
  }

  const data = await response.json();
  return { status: response.status, data };
}
