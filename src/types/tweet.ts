interface PollV2 {
    id: string;
    options: {
        position: number;
        label: string;
        votes: number;
    }[];
    duration_minutes?: number;
    end_datetime?: string;
    voting_status?: string;
}
interface Photo {
    id: string;
    url: string;
    alt_text: string | undefined;
}
interface Video {
    id: string;
    preview: string;
    url?: string;
}
interface Mention {
    id: string;
    username?: string;
    name?: string;
}

interface Mention {
    id: string;
    username?: string;
    name?: string;
}
interface Photo {
    id: string;
    url: string;
    alt_text: string | undefined;
}
interface Video {
    id: string;
    preview: string;
    url?: string;
}
interface PlaceRaw {
    id?: string;
    place_type?: string;
    name?: string;
    full_name?: string;
    country_code?: string;
    country?: string;
    bounding_box?: {
        type?: string;
        coordinates?: number[][][];
    };
}

/**
 * A parsed Tweet object.
 */
export interface MongoTweet {
    bookmarkCount?: number;
    conversationId?: string;
    hashtags: string[];
    html?: string;
    id: string;
    //   inReplyToStatus?: MongoTweet;
    inReplyToStatusId?: string;
    isQuoted?: boolean;
    isPin?: boolean;
    isReply?: boolean;
    isRetweet?: boolean;
    isSelfThread?: boolean;
    language?: string;
    likes?: number;
    name?: string;
    mentions: Mention[];
    permanentUrl?: string;
    photos: Photo[];
    place?: PlaceRaw;
    //   quotedStatus?: MongoTweet;
    quotedStatusId?: string;
    quotes?: number;
    replies?: number;
    retweets?: number;
    //   retweetedStatus?: MongoTweet;
    retweetedStatusId?: string;
    text?: string;
    //   thread: MongoTweet[];
    timeParsed?: Date | null;
    timestamp?: number;
    urls: string[];
    userId?: string;
    username?: string;
    videos: Video[];
    views?: number;
    sensitiveContent?: boolean;
    poll?: PollV2 | null;
    isApiFetch?: boolean;
    createdAt?: string;
}
export interface MongoTweetWithPoints extends MongoTweet {
    likes: number;
    replies: number;
    retweets: number;
    quotes: number;
    bookmarkCount: number;
    engagementPoints: number;
    earlyMultiplier: number;
    baseEngagementPoints: number;
    projectId: string;
    //TODO: remove Temporary field for batch insert
    batchInsert?: boolean;
    customMultiplier?: number;
    penaltyMultiplier?: number;
}

export interface TwitterApiUrl {
    display_url: string;
    expanded_url: string;
    indices: number[];
    url: string;
}

export interface TwitterApiUserEntity {
    urls: TwitterApiUrl[];
}

export interface TwitterApiUser {
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
            description: TwitterApiUserEntity;
            url: TwitterApiUserEntity;
        };
    };
}

export interface TwitterApiEntities {
    hashtags: {
        indices: number[];
        text: string;
    }[];
    urls: TwitterApiUrl[];
    user_mentions: {
        id_str: string;
        name: string;
        screen_name: string;
    }[];
    media?: any[];
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
    author: TwitterApiUser;
    entities: TwitterApiEntities;
    quoted_tweet?: any;
    retweeted_tweet?: any;
    isLimitedReply: boolean;
    extendedEntities?: {
        media?: {
            media_url_https: string;
            type: 'photo' | 'video' | 'animated_gif';
            video_info?: {
                variants: {
                    bitrate?: number;
                    content_type: string;
                    url: string;
                }[];
            };
        }[]
    }
}