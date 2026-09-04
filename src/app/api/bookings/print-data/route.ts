import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findLrBookingByNo } from "@/lib/find-lr";
import { apiError } from "@/lib/handle-api-error";
import { stripBookingTrackToken } from "@/services/trackingService";

type PartyLite = { name: string; address: string; gst: string };

function matchParty(parties: PartyLite[], name: string) {
  const q = name.trim().toLowerCase();
  if (!q) return null;
  return parties.find((p) => p.name.trim().toLowerCase() === q) ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const lrNo = req.nextUrl.searchParams.get("lrNo")?.trim() || "";
    const source = req.nextUrl.searchParams.get("source")?.trim().toUpperCase() || "";
    if (!lrNo) {
      return NextResponse.json({ error: "LR number required" }, { status: 400 });
    }

    const lr = await findLrBookingByNo(lrNo);
    if (!lr) {
      return NextResponse.json({ error: "LR not found" }, { status: 404 });
    }

    const lrSource = (lr.source || "DPR").toUpperCase();
    if (source === "ROADWAYS" && lrSource !== "ROADWAYS") {
      return NextResponse.json({ error: "Roadways LR not found" }, { status: 404 });
    }
    if (source === "DPR" && lrSource === "ROADWAYS") {
      return NextResponse.json({ error: "DPR LR not found" }, { status: 404 });
    }

    const parties = await prisma.party.findMany({
      select: { name: true, address: true, gst: true },
    });

    const booking = stripBookingTrackToken({ ...lr } as Record<string, unknown>);
    return NextResponse.json({
      booking,
      consignorParty: matchParty(parties, lr.consignor),
      consigneeParty: matchParty(parties, lr.consignee),
    });
  } catch (err) {
    return apiError(err, "Print data failed");
  }
}
