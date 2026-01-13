import { NextResponse } from "next/server";
import { neynarService } from "@/services/neynar.service";

const TOTAL_TOKEN_AMOUNT = 250_000_000; // 250 million tokens

interface BestFriendUser {
    fid: number;
    mutual_affinity_score: number;
    username: string;
}

interface BestFriendWithTokens extends BestFriendUser {
    tokenAmount: number;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const fid = searchParams.get("fid");

        if (!fid) {
            return NextResponse.json(
                { error: "fid query parameter is required" },
                { status: 400 }
            );
        }

        const fidNumber = parseInt(fid, 10);
        if (isNaN(fidNumber) || fidNumber < 1) {
            return NextResponse.json(
                { error: "fid must be a valid positive integer" },
                { status: 400 }
            );
        }

        const data = await neynarService.fetchBestFriends(fidNumber);

        // Calculate total affinity score for token distribution
        const totalAffinityScore = data.users.reduce(
            (sum: number, user: BestFriendUser) => sum + user.mutual_affinity_score,
            0
        );

        // Distribute 250 million tokens according to mutual_affinity_score
        const usersWithTokens: BestFriendWithTokens[] = data.users.map((user: BestFriendUser) => ({
            ...user,
            tokenAmount: totalAffinityScore > 0
                ? Math.floor((user.mutual_affinity_score / totalAffinityScore) * TOTAL_TOKEN_AMOUNT)
                : 0,
        }));

        return NextResponse.json({
            users: usersWithTokens,
            totalTokensDistributed: usersWithTokens.reduce((sum, user) => sum + user.tokenAmount, 0),
            totalAffinityScore,
        });
    } catch (error: any) {
        console.error("Error fetching best friends:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch best friends",
                details: error.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}
