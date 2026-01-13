import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy endpoint to get token configuration from Empire Builder
 * This keeps the API key server-side
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
        if (!body.name || !body.symbol || !body.creatorAddress) {
            return NextResponse.json(
                { error: 'Missing required fields: name, symbol, imageUrl, creatorAddress' },
                { status: 400 }
            );
        }

        // Validate signature and message
        if (!body.signature || !body.message) {
            return NextResponse.json(
                { error: 'Missing required fields: signature and message are required for deployment' },
                { status: 400 }
            );
        }

        const configResponse = await fetch('https://empirebuilder.world/api/get-token-config-sang', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({
                // Basic token info
                name: body.name,
                symbol: body.symbol,
                imageUrl: body.imageUrl,
                creatorAddress: body.creatorAddress,
                signature: body.signature,
                message: body.message,

                // Pool Configuration (standard for SANG endpoint)
                poolType: 'standard',
                feeType: 'dynamic',
                initialMarketCap: body.initialMarketCap || 10,

                // Dynamic Fees
                dynamicBaseFee: body.dynamicBaseFee || 1,
                dynamicMaxLpFee: body.dynamicMaxLpFee || 2.2,

                // Dev buy disabled for sang endpoint
                enableDevBuy: false,
                devBuyAmount: 0,

                // Optional: Creator Vault
                ...(body.vaultPercentage && {
                    vaultPercentage: body.vaultPercentage,
                    vaultDays: body.vaultDays || 30,
                }),

                // Optional: Sniper Fee Protection
                ...(body.enableSniperFees && {
                    enableSniperFees: true,
                    sniperFeeDuration: body.sniperFeeDuration || 60,
                }),
            })
        });

        if (!configResponse.ok) {
            const errorText = await configResponse.text();
            console.error('Empire Builder API error:', errorText);
            return NextResponse.json(
                { error: 'Failed to get token config from Empire Builder', details: errorText },
                { status: configResponse.status }
            );
        }

        const data = await configResponse.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Error getting token config:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
