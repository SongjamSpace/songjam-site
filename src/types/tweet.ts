export interface TweetAuthor {
    type: string;
    userName: string;
    url: string;
    id: string;
    name: string;
    isBlueVerified: boolean;
    verifiedType: string;
    profilePicture: string;
    coverPicture: string;
    description: string;
    location: string;
    followers: number;
    following: number;
    canDm: boolean;
    createdAt: string;
    favouritesCount: number;
    hasCustomTimelines: boolean;
    isTranslator: boolean;
    mediaCount: number;
    statusesCount: number;
    withheldInCountries: string[];
    affiliatesHighlightedLabel: Record<string, any>;
    possiblySensitive: boolean;
    pinnedTweetIds: string[];
    isAutomated: boolean;
    automatedBy: string;
    unavailable: boolean;
    message: string;
    unavailableReason: string;
    profile_bio: {
        description: string;
        entities: {
            description: {
                urls: {
                    display_url: string;
                    expanded_url: string;
                    indices: number[];
                    url: string;
                }[];
            };
            url: {
                urls: {
                    display_url: string;
                    expanded_url: string;
                    indices: number[];
                    url: string;
                }[];
            };
        };
    };
}

export interface TweetEntities {
    hashtags: {
        indices: number[];
        text: string;
    }[];
    urls: {
        display_url: string;
        expanded_url: string;
        indices: number[];
        url: string;
    }[];
    user_mentions: {
        id_str: string;
        name: string;
        screen_name: string;
    }[];
    // Adding media optional as it is common in tweets and code might use it, though not in user snippet explicitly.
    media?: {
        display_url: string;
        expanded_url: string;
        id_str: string;
        indices: number[];
        media_url_https: string;
        type: string;
        url: string;
        sizes: any;
        video_info?: {
            aspect_ratio: number[];
            duration_millis: number;
            variants: {
                bitrate?: number;
                content_type: string;
                url: string;
            }[];
        };
    }[];
}

export interface TwitterApiTweet {
    type: string;
    id: string;
    url: string;
    text: string;
    source: string;
    retweetCount: number;
    replyCount: number;
    likeCount: number;
    quoteCount: number;
    viewCount: number;
    createdAt: string;
    lang: string;
    bookmarkCount: number;
    isReply: boolean;
    inReplyToId: string;
    conversationId: string;
    displayTextRange: number[];
    inReplyToUserId: string;
    inReplyToUsername: string;
    author: TweetAuthor;
    entities: TweetEntities;
    quoted_tweet?: any;
    retweeted_tweet?: any;
    isLimitedReply: boolean;
    // Compatibility fields (optional) if needed by existing code logic that we might adapt or fields that might be present
    html?: string;
    photos?: { url: string }[];
    videos?: { url: string; preview: string }[];
}
