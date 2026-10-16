import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  PERSONA_COOKIE,
  TOKEN_COOKIE_OPTIONS,
  PERSONA_COOKIE_OPTIONS,
} from "@/lib/auth/cookies";
import { handleMockRequest } from "@/lib/mock";
import type { MockPersona } from "@/lib/types/navigation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { detail: "Username and password are required" },
        { status: 400 }
      );
    }

    const mockRes = await handleMockRequest("POST", "/auth/login", {}, body);
    if (mockRes.status !== 200) {
      return NextResponse.json(mockRes.data, { status: mockRes.status });
    }

    const tokenData = mockRes.data as {
      access_token: string;
      refresh_token: string;
      user: {
        id?: string;
        username?: string;
        fullname?: string;
        display_name?: string;
        email?: string;
        persona?: MockPersona;
        is_tenant_admin?: boolean;
      };
    };

    const persona: MockPersona =
      tokenData.user?.persona ||
      (username === "sales" ? "sales" : username === "inventory" ? "inventory" : "admin");

    const res = NextResponse.json({
      success: true,
      user: tokenData.user,
    });

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
    res.cookies.set(PERSONA_COOKIE, persona, PERSONA_COOKIE_OPTIONS);

    return res;
  } catch (error) {
    return NextResponse.json(
      { detail: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
