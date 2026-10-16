import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  PERSONA_COOKIE,
  TOKEN_COOKIE_OPTIONS,
} from "@/lib/auth/cookies";
import { handleMockRequest } from "@/lib/mock";
import type { MockPersona } from "@/lib/types/navigation";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
    const persona = (cookieStore.get(PERSONA_COOKIE)?.value || "admin") as MockPersona;

    if (!refreshToken) {
      return NextResponse.json(
        { detail: "No refresh token provided" },
        { status: 401 }
      );
    }

    const mockRes = await handleMockRequest(
      "POST",
      "/auth/refresh",
      {},
      { refresh_token: refreshToken },
      persona
    );
    if (mockRes.status !== 200) {
      return NextResponse.json(mockRes.data, { status: mockRes.status });
    }

    const tokenData = mockRes.data as {
      access_token: string;
      refresh_token: string;
    };

    const res = NextResponse.json({ success: true });
    res.cookies.set(
      ACCESS_TOKEN_COOKIE,
      tokenData.access_token,
      TOKEN_COOKIE_OPTIONS
    );
    res.cookies.set(
      REFRESH_TOKEN_COOKIE,
      tokenData.refresh_token,
      TOKEN_COOKIE_OPTIONS
    );
    return res;
  } catch (error) {
    return NextResponse.json(
      { detail: (error as Error).message || "Token refresh failed" },
      { status: 500 }
    );
  }
}
