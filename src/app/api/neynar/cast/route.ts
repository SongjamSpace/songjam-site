import { NextResponse } from "next/server";
import { neynarService } from "@/services/neynar.service";

export async function POST(req: Request) {
    try {
        const { signer_uuid, text, embeds } = await req.json();

        if (!signer_uuid || !text) {
            return NextResponse.json(
                { error: "signer_uuid and text are required" },
                { status: 400 }
            );
        }

        const castRes = await neynarService.publishCast({
            signerUuid: signer_uuid,
            text: text,
            embeds
        });

        return NextResponse.json(castRes);
    } catch (error: any) {
        console.error("Error posting cast to Neynar:", error);
        return NextResponse.json(
            {
                error: "Failed to post cast",
                details: error.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}
