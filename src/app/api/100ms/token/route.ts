import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const APP_ACCESS_KEY = process.env.NEXT_PUBLIC_100MS_ACCESS_KEY;
const APP_SECRET = process.env.NEXT_PUBLIC_100MS_APP_SECRET;
// Add your 100ms template ID here - get it from dashboard.100ms.live
const TEMPLATE_ID = process.env.NEXT_PUBLIC_100MS_TEMPLATE_ID || '';

if (!APP_ACCESS_KEY || !APP_SECRET) {
    console.error('100ms keys are missing');
}

export async function POST(req: NextRequest) {
    try {
        const { role, userId } = await req.json();

        if (!role) {
            return NextResponse.json({ error: 'Role is required' }, { status: 400 });
        }

        if (!TEMPLATE_ID) {
            console.warn('⚠️  No template ID set. Using default template. Configure NEXT_PUBLIC_100MS_TEMPLATE_ID for proper role support.');
        }

        // 1. Generate Management Token to call 100ms API
        const managementToken = jwt.sign(
            {
                access_key: APP_ACCESS_KEY,
                type: 'management',
                version: 2,
                iat: Math.floor(Date.now() / 1000),
                nbf: Math.floor(Date.now() / 1000),
            },
            APP_SECRET!,
            {
                algorithm: 'HS256',
                expiresIn: '24h',
                jwtid: crypto.randomUUID(),
            }
        );

        // 2. Get or Create Room "genesis-room"
        let roomId;
        const roomName = 'genesis-room';

        // List all rooms and find existing one
        const listResponse = await fetch('https://api.100ms.live/v2/rooms', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${managementToken}`,
            },
        });

        if (listResponse.ok) {
            const listData = await listResponse.json();
            const existingRoom = listData.data?.find((r: any) => r.name === roomName);
            if (existingRoom) {
                roomId = existingRoom.id;
                console.log('Using existing room:', roomId);
            }
        }

        // Create room if it doesn't exist
        if (!roomId) {
            const createResponse = await fetch('https://api.100ms.live/v2/rooms', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${managementToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: roomName,
                    description: 'Genesis Leaderboard Audio Room',
                    template_id: TEMPLATE_ID || undefined,
                    region: 'us'
                }),
            });

            if (createResponse.ok) {
                const roomData = await createResponse.json();
                roomId = roomData.id;
                console.log('Created new room:', roomId);
            } else {
                const errorData = await createResponse.json();
                console.error('Failed to create room:', errorData);
                return NextResponse.json({
                    error: 'Failed to create room',
                    details: errorData
                }, { status: 500 });
            }
        }

        if (!roomId) {
            return NextResponse.json({ error: 'Failed to find or create room' }, { status: 500 });
        }

        // 3. Generate App Token for the user
        const appToken = jwt.sign(
            {
                access_key: APP_ACCESS_KEY,
                room_id: roomId,
                user_id: userId || 'anonymous',
                role: role,
                type: 'app',
                version: 2,
                iat: Math.floor(Date.now() / 1000),
                nbf: Math.floor(Date.now() / 1000),
            },
            APP_SECRET!,
            {
                algorithm: 'HS256',
                expiresIn: '24h',
                jwtid: crypto.randomUUID(),
            }
        );

        return NextResponse.json({ token: appToken });

    } catch (error: any) {
        console.error('Error generating token:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error?.message
        }, { status: 500 });
    }
}
