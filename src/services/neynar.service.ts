import axios from "axios";

const NEYNAR_API_URL = "https://api.neynar.com/v2";

export const neynarService = {
    publishCast: async ({ signerUuid, text, embeds }: { signerUuid: string; text: string; embeds?: string[] }) => {
        try {
            console.log("signerUuid:", signerUuid);
            console.log("text:", text);
            console.log("embeds:", embeds);
            const response = await axios.post(
                `${NEYNAR_API_URL}/farcaster/cast`,
                {
                    signer_uuid: signerUuid,
                    text: text,
                    embeds: embeds?.map(url => ({ url })) || [],
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

    followUser: async ({ signerUuid, targetFid }: { signerUuid: string; targetFid: number }) => {
        try {
            const response = await axios.post(
                `${NEYNAR_API_URL}/farcaster/user/follow`,
                {
                    signer_uuid: signerUuid,
                    target_fids: [targetFid],
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
                "Neynar API Error (Follow):",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    fetchBulkUsers: async (fids: string | number[], viewerFid?: number) => {
        try {
            const fidsParam = Array.isArray(fids) ? fids.join(',') : fids;
            const params: any = { fids: fidsParam };
            if (viewerFid) {
                params.viewer_fid = viewerFid;
            }

            const response = await axios.get(
                `${NEYNAR_API_URL}/farcaster/user/bulk`,
                {
                    params,
                    headers: {
                        'x-api-key': process.env.NEYNAR_API_KEY,
                        "content-type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            console.error(
                "Neynar API Error (Bulk Users):",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    fetchBestFriends: async (fid: number, limit: number = 100) => {
        try {
            const allUsers: Array<{ fid: number; mutual_affinity_score: number; username: string }> = [];
            let cursor: string | null = null;

            // Paginate to fetch all best friends
            do {
                const params: any = { fid, limit };
                if (cursor) {
                    params.cursor = cursor;
                }

                const response = await axios.get(
                    `${NEYNAR_API_URL}/farcaster/user/best_friends`,
                    {
                        params,
                        headers: {
                            'x-api-key': process.env.NEYNAR_API_KEY,
                            "content-type": "application/json",
                        },
                    }
                );

                allUsers.push(...response.data.users);
                cursor = response.data.next?.cursor || null;
            } while (cursor);

            return { users: allUsers };
        } catch (error: any) {
            console.error(
                "Neynar API Error (Best Friends):",
                error.response?.data || error.message
            );
            throw error;
        }
    },
};
