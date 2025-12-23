import { NextResponse } from "next/server";
import { neynarService } from "@/services/neynar.service";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const fids = searchParams.get("fids");
        const viewerFid = searchParams.get("viewer_fid");

        if (!fids) {
            return NextResponse.json(
                { error: "fids query parameter is required" },
                { status: 400 }
            );
        }

        const data = await neynarService.fetchBulkUsers(
            fids,
            viewerFid ? parseInt(viewerFid) : undefined
        );

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error fetching bulk users:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch bulk users",
                details: error.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}
