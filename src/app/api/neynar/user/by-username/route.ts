import { NextResponse } from "next/server";
import { neynarService } from "@/services/neynar.service";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get("username");

        if (!username) {
            return NextResponse.json(
                { error: "username query parameter is required" },
                { status: 400 }
            );
        }

        const data = await neynarService.lookupUserByXUsername(username);

        return NextResponse.json({ status: "success", data });
    } catch (error: any) {
        console.error("Error looking up user by X username:", error);
        return NextResponse.json(
            {
                error: "Failed to lookup user",
                details: error.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}
