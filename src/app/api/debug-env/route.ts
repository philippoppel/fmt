import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  let dbTest = "not tested";
  let therapistCount = -1;

  try {
    therapistCount = await db.therapistProfile.count();
    dbTest = "success";
  } catch (error) {
    dbTest = `error: ${error instanceof Error ? error.message : "unknown"}`;
  }

  return NextResponse.json({
    hasDbUrl: !!process.env.DATABASE_URL,
    hasDbUrlUnpooled: !!process.env.DATABASE_URL_UNPOOLED,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    isVercel: !!process.env.VERCEL,
    nodeEnv: process.env.NODE_ENV,
    dbUrlPreview: process.env.DATABASE_URL
      ? `${process.env.DATABASE_URL.slice(0, 15)}...${process.env.DATABASE_URL.slice(-10)}`
      : "not set",
    dbTest,
    therapistCount,
  });
}
