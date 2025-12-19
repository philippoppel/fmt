import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ therapists: [] });
  }

  try {
    const therapists = await db.therapistProfile.findMany({
      where: {
        isPublished: true,
        OR: [
          { user: { name: { contains: query, mode: "insensitive" } } },
          { city: { contains: query, mode: "insensitive" } },
          { title: { contains: query, mode: "insensitive" } },
          { shortDescription: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        city: true,
        imageUrl: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      take: 10,
      orderBy: { user: { name: "asc" } },
    });

    // Transform to flat structure
    const result = therapists.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.user.name || "Unbekannt",
      title: t.title,
      city: t.city,
      imageUrl: t.imageUrl,
    }));

    return NextResponse.json({ therapists: result });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ therapists: [] }, { status: 500 });
  }
}
