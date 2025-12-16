import { NextResponse } from "next/server";
import { neynarService } from "@/services/neynar.service";

export async function POST(req: Request) {
    try {
        const { signer_uuid, target } = await req.json();

        if (!signer_uuid || !target) {
            return NextResponse.json(
                { error: "signer_uuid and target (cast hash) are required" },
                { status: 400 }
            );
        }

        const result = await neynarService.publishReaction({
            signerUuid: signer_uuid,
            reaction: "like",
            castHash: target,
        });

        return NextResponse.json({ status: "success", result });
    } catch (error: any) {
        console.error("Error liking cast:", error);
        return NextResponse.json(
            {
                error: "Failed to like cast",
                details: error.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}
