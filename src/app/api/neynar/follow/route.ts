import { NextResponse } from "next/server";
import { neynarService } from "@/services/neynar.service";

export async function POST(req: Request) {
    try {
        const { signer_uuid, target_fid } = await req.json();

        if (!signer_uuid || !target_fid) {
            return NextResponse.json(
                { error: "signer_uuid and target_fid are required" },
                { status: 400 }
            );
        }

        const result = await neynarService.followUser({
            signerUuid: signer_uuid,
            targetFid: target_fid,
        });

        return NextResponse.json({ status: "success", result });
    } catch (error: any) {
        console.error("Error following user:", error);
        return NextResponse.json(
            {
                error: "Failed to follow user",
                details: error.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}
