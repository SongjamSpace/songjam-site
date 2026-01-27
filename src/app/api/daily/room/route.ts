
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const apiKey = process.env.DAILY_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: 'Daily API key is not configured' },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        
        // Default options for an audio room
        const options = {
            privacy: 'public',
            properties: {
                // Expire after 24 hours by default
                exp: Math.round(Date.now() / 1000) + 24 * 60 * 60,
                enable_chat: true,
                start_video_off: true,
                start_audio_off: false, // Start with audio on? Or off and let user unmute?
                // For "Host launches", we might want host to have owner token, but for now public room
                ...body.properties
            }
        };

        const response = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(options),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create Daily room: ${errorText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Error creating Daily room:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
