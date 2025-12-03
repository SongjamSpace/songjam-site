export interface FarcasterUser {
    object: "user";
    fid: number;
    username: string;
    display_name: string;
    custody_address: string;
    pfp_url: string;
    profile: {
        bio: {
            text?: string;
        };
    };
    follower_count: number;
    following_count: number;
    verifications: string[];
    verified_addresses: {
        eth_addresses: string[];
        sol_addresses: string[];
    };
}

export interface FarcasterCast {
    object: "cast";
    hash: string;
    parent_hash?: string;
    parent_url?: string;
    root_parent_url?: string;
    author: FarcasterUser;
    text: string;
    timestamp: string;
    embeds?: Array<{
        url?: string;
        cast_id?: {
            fid: number;
            hash: string;
        };
    }>;
    reactions: {
        likes_count: number;
        recasts_count: number;
    };
    replies: {
        count: number;
    };
    channel?: {
        id: string;
        name: string;
        image_url: string;
    };
    mentioned_profiles?: FarcasterUser[];
}

export interface FeedResponse {
    casts: FarcasterCast[];
    next?: {
        cursor: string;
    };
}

export interface FeedSummary {
    totalCasts: number;
    topTopics: string[];
    keyInsights: string[];
    trendingAuthors: string[];
}
