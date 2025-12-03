import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const fid = searchParams.get("fid");
    const limit = searchParams.get("limit") || "25";
    const cursor = searchParams.get("cursor");

    if (!fid) {
        return NextResponse.json(
            { error: "FID is required" },
            { status: 400 }
        );
    }

    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "Neynar API key not configured" },
            { status: 500 }
        );
    }

    try {
        let url = `https://api.neynar.com/v2/farcaster/feed/for_you?fid=${fid}&limit=${limit}`;
        if (cursor) {
            url += `&cursor=${cursor}`;
        }

        const response = await fetch(url, {
            headers: {
                "x-api-key": apiKey,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Neynar API error:", error);
            return NextResponse.json(
                { error: "Failed to fetch feed" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching feed:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
