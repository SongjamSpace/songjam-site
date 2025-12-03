import { StreamClient } from '@stream-io/node-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
        const apiSecret = process.env.NEXT_PUBLIC_STREAM_API_SECRET;

        if (!apiKey || !apiSecret) {
            console.error('Stream API credentials not configured');
            return NextResponse.json(
                { error: 'Stream API not configured' },
                { status: 500 }
            );
        }

        // Create Stream client
        const client = new StreamClient(apiKey, apiSecret);

        // Generate token for the user
        const token = client.generateUserToken({ user_id: userId });

        return NextResponse.json({ token });
    } catch (error) {
        console.error('Error generating Stream token:', error);
        return NextResponse.json(
            { error: 'Failed to generate token' },
            { status: 500 }
        );
    }
}
