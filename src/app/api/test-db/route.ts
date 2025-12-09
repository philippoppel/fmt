import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    console.log("[test-db] Starting database test...");

    const startTime = Date.now();

    // Test therapist profiles query
    const profiles = await db.therapistProfile.findMany({
      take: 3,
      select: {
        id: true,
        city: true,
        specializations: true,
      },
    });

    const duration = Date.now() - startTime;

    console.log(`[test-db] Query completed in ${duration}ms, found ${profiles.length} profiles`);

    return NextResponse.json({
      success: true,
      count: profiles.length,
      duration: `${duration}ms`,
      profiles: profiles.map(p => ({ id: p.id, city: p.city })),
    });
  } catch (error) {
    console.error("[test-db] Error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
