import { NextResponse } from "next/server";

const UOM_API_URL = process.env.UOM_API_URL || "http://localhost:8000/api/uom";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ detail: "A valid UOM ID is required." }, { status: 400 });
  }

  const token = process.env.UOM_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { detail: "UOM_API_TOKEN is not configured on the server." },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${UOM_API_URL.replace(/\/+$/, "")}/${id}`, {
      method: "PATCH",
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
