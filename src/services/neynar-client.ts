import axios from "axios";

export const neynarClient = {
    postCast: async (signerUuid: string, text: string, mediaUrls: string[]) => {
        try {
            const response = await axios.post("/api/neynar/cast", {
                signer_uuid: signerUuid,
                text,
                embeds: mediaUrls
            });
            return response.data;
        } catch (error: any) {
            console.error("Error posting cast:", error);
            throw error;
        }
    },

    lookupUserByXUsername: async (username: string) => {
        try {
            const response = await axios.get("/api/neynar/user/by-username", {
                params: { username },
            });
            return response.data;
        } catch (error: any) {
            console.error("Error looking up user:", error);
            throw error;
        }
    },

    publishLike: async (signerUuid: string, castHash: string) => {
        try {
            const response = await axios.post("/api/neynar/like", {
                signer_uuid: signerUuid,
                target: castHash,
            });
            return response.data;
        } catch (error: any) {
            console.error("Error liking cast:", error);
            throw error;
        }
    },

    publishRecast: async (signerUuid: string, castHash: string) => {
        try {
            const response = await axios.post("/api/neynar/recast", {
                signer_uuid: signerUuid,
                target: castHash,
            });
            return response.data;
        } catch (error: any) {
            console.error("Error recasting:", error);
            throw error;
        }
    },

    publishFollow: async (signerUuid: string, targetFid: number) => {
        try {
            const response = await axios.post("/api/neynar/follow", {
                signer_uuid: signerUuid,
                target_fid: targetFid,
            });
            return response.data;
        } catch (error: any) {
            console.error("Error following user:", error);
            throw error;
        }
    },
};
