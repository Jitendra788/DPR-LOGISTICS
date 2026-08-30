import { NextRequest, NextResponse } from "next/server";
import { trackShipment } from "@/services/trackingService";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      trackingNumber?: string;
      mobileLast4?: string;
      trackToken?: string;
    };
    const result = await trackShipment({
      trackingNumber: String(body.trackingNumber ?? ""),
      mobileLast4: String(body.mobileLast4 ?? ""),
      trackToken: String(body.trackToken ?? ""),
    });
    if (!result.ok) {
      const status = result.code === "NOT_FOUND" ? 404 : result.code === "FORBIDDEN" ? 403 : 400;
      return NextResponse.json(result, { status });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Tracking service unavailable.", code: "SERVER" },
      { status: 500 },
    );
  }
}
