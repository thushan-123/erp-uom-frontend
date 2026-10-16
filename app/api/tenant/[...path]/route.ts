import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, PERSONA_COOKIE } from "@/lib/auth/cookies";
import { shouldMockPath, BACKEND_URL } from "@/lib/api/config";
import { handleMockRequest } from "@/lib/mock";
import type { MockPersona } from "@/lib/types/navigation";

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathStr = "/" + path.join("/");
    const method = request.method;

    const url = new URL(request.url);
    const query: Record<string, string> = {};
    url.searchParams.forEach((val, key) => {
      query[key] = val;
    });

    let body: unknown = null;
    if (["POST", "PUT", "PATCH"].includes(method)) {
      try {
        body = await request.json();
      } catch {
        body = null;
      }
    }

    const cookieStore = await cookies();
    const persona = (cookieStore.get(PERSONA_COOKIE)?.value || "admin") as MockPersona;
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

    if (shouldMockPath(pathStr)) {
      const mockRes = await handleMockRequest(
        method,
        pathStr,
        query,
        body,
        persona
      );
      return NextResponse.json(mockRes.data, { status: mockRes.status });
    }

    // Real backend forward
    const queryStr = url.searchParams.toString()
      ? `?${url.searchParams.toString()}`
      : "";
    const backendUrl = `${BACKEND_URL}${pathStr}${queryStr}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const backendRes = await fetch(backendUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (backendRes.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    return NextResponse.json(
      { detail: (error as Error).message || "Proxy request failed" },
      { status: 500 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
