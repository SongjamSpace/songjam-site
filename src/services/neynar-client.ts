import axios from "axios";

export const neynarClient = {
    postCast: async (signerUuid: string, text: string) => {
        try {
            const response = await axios.post("/api/neynar/cast", {
                signer_uuid: signerUuid,
                text,
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
};
