import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy endpoint to deploy Empire contract after token deployment
 * IMPORTANT: Empire must be deployed within 5 minutes of token creation
 */
export async function POST(request: NextRequest) {
    const apiKey = process.env.EMPIRE_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: 'Empire API key is not configured' },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();

        // Validate required fields
        if (!body.tokenAddress || !body.name || !body.ownerAddress) {
            return NextResponse.json(
                { error: 'Missing required fields: tokenAddress, name, ownerAddress' },
                { status: 400 }
            );
        }

        const empireResponse = await fetch('https://empirebuilder.world/api/deploy-empire-trusted', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({
                baseToken: body.tokenAddress,
                name: body.name,
                owner: body.ownerAddress,
                tokenInfo: {
                    symbol: body.symbol,
                    name: body.name,
                    logoURI: body.imageUrl
                }
            })
        });

        if (!empireResponse.ok) {
            const errorText = await empireResponse.text();
            console.error('Empire Builder deploy error:', errorText);
            return NextResponse.json(
                { error: 'Failed to deploy Empire contract', details: errorText },
                { status: empireResponse.status }
            );
        }

        const data = await empireResponse.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Error deploying Empire:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
