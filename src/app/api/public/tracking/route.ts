import { NextRequest, NextResponse } from "next/server";
import { trackShipment } from "@/services/trackingService";

export async function POST(req: NextRequest) {
  try {
    const { trackingNumber } = (await req.json()) as { trackingNumber?: string };
    const result = await trackShipment(String(trackingNumber ?? ""));
    if (!result.ok) {
      return NextResponse.json(result, { status: result.code === "NOT_FOUND" ? 404 : 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Tracking service unavailable.", code: "SERVER" },
      { status: 500 },
    );
  }
}
