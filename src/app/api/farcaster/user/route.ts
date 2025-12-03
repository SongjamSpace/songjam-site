import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username");

    if (!username) {
        return NextResponse.json(
            { error: "Username is required" },
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
        const response = await fetch(
            `https://api.neynar.com/v2/farcaster/user/by_username?username=${username}`,
            {
                headers: {
                    "x-api-key": apiKey,
                },
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error("Neynar API error:", error);
            return NextResponse.json(
                { error: "Failed to fetch user data" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
