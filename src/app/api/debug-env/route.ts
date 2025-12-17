import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasDbUrl: !!process.env.DATABASE_URL,
    hasDbUrlUnpooled: !!process.env.DATABASE_URL_UNPOOLED,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    isVercel: !!process.env.VERCEL,
    nodeEnv: process.env.NODE_ENV,
    // Show first/last chars for debugging (don't expose full value)
    dbUrlPreview: process.env.DATABASE_URL
      ? `${process.env.DATABASE_URL.slice(0, 15)}...${process.env.DATABASE_URL.slice(-10)}`
      : "not set",
  });
}
