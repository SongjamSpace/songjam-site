import axios from "axios";

const NEYNAR_API_URL = "https://api.neynar.com/v2";

export const neynarService = {
    publishCast: async ({ signerUuid, text }: { signerUuid: string; text: string }) => {
        try {
            console.log("signerUuid:", signerUuid);
            console.log("text:", text);
            const response = await axios.post(
                `${NEYNAR_API_URL}/farcaster/cast`,
                {
                    signer_uuid: signerUuid,
                    text: text,
                },
                {
                    headers: {
                        'x-api-key': process.env.NEYNAR_API_KEY,
                        "content-type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            console.error(
                "Neynar API Error:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    lookupUserByXUsername: async (username: string) => {
        try {
            const response = await axios.get(
                `${NEYNAR_API_URL}/farcaster/user/by_x_username`,
                {
                    params: { username },
                    headers: {
                        'x-api-key': process.env.NEYNAR_API_KEY,
                        "content-type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            console.error(
                "Neynar API Error (User Lookup):",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    publishReaction: async ({ signerUuid, reaction, castHash }: { signerUuid: string; reaction: 'like' | 'recast'; castHash: string }) => {
        try {
            const response = await axios.post(
                `${NEYNAR_API_URL}/farcaster/reaction`,
                {
                    signer_uuid: signerUuid,
                    reaction_type: reaction,
                    target: castHash,
                },
                {
                    headers: {
                        'x-api-key': process.env.NEYNAR_API_KEY,
                        "content-type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            console.error(
                "Neynar API Error (Reaction):",
                error.response?.data || error.message
            );
            throw error;
        }
    },
};
