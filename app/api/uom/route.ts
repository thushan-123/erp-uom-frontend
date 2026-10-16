import { NextResponse } from "next/server";

const UOM_API_URL = process.env.UOM_API_URL || "http://localhost:8000/api/uom";

export async function GET() {
  const token = process.env.UOM_API_TOKEN;

  if (!token) {
    return NextResponse.json(
      { detail: "UOM_API_TOKEN is not configured on the server." },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(UOM_API_URL, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const body = await response.json().catch(() => null);
    return NextResponse.json(
      body ?? { detail: "The UOM service returned an invalid JSON response." },
      { status: response.status }
    );
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error ? error.message : "Unable to reach the UOM service.",
      },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const token = process.env.UOM_API_TOKEN;

  if (!token) {
    return NextResponse.json(
      { detail: "UOM_API_TOKEN is not configured on the server." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "A valid JSON request body is required." }, { status: 400 });
  }

  try {
    const response = await fetch(UOM_API_URL, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const responseBody = await response.json().catch(() => null);
    return NextResponse.json(
      responseBody ?? { detail: "The UOM service returned an invalid JSON response." },
      { status: response.status }
    );
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error ? error.message : "Unable to reach the UOM service.",
      },
      { status: 502 }
    );
  }
}
