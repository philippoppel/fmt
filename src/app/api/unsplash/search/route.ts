import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const UNSPLASH_API_URL = "https://api.unsplash.com";

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  width: number;
  height: number;
  color: string;
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

/**
 * Search Unsplash for images
 * GET /api/unsplash/search?query=nature&page=1&per_page=20
 */
export async function GET(request: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Nicht authentifiziert" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("per_page") || "20";

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter required" },
      { status: 400 }
    );
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json(
      { error: "Unsplash API not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Unsplash API error:", error);
      return NextResponse.json(
        { error: "Unsplash API error" },
        { status: response.status }
      );
    }

    const data: UnsplashSearchResponse = await response.json();

    // Transform to simpler format
    const photos = data.results.map((photo) => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbUrl: photo.urls.small,
      alt: photo.alt_description || photo.description || "Unsplash image",
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      photographerUsername: photo.user.username,
      width: photo.width,
      height: photo.height,
      color: photo.color,
    }));

    return NextResponse.json({
      photos,
      total: data.total,
      totalPages: data.total_pages,
      page: parseInt(page),
    });
  } catch (error) {
    console.error("Unsplash search error:", error);
    return NextResponse.json(
      { error: "Failed to search Unsplash" },
      { status: 500 }
    );
  }
}
