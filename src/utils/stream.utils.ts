import { StreamVideoClient, User } from '@stream-io/video-react-sdk';

/**
 * Generate a unique call ID for Stream.io
 */
export function generateCallId(): string {
    // Use crypto.randomUUID if available, otherwise fallback to timestamp + random
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Create a Stream.io user object from Twitter user data
 */
export function createStreamUser(twitterObj: {
    twitterId?: string;
    name?: string | null;
    username?: string;
}): User {
    return {
        id: twitterObj.twitterId || 'anonymous',
        name: twitterObj.name || 'Anonymous User',
        image: `https://getstream.io/random_svg/?id=${twitterObj.twitterId || 'anonymous'}&name=${encodeURIComponent(twitterObj.name || 'Anonymous')}`,
    };
}

/**
 * Cleanup Stream client properly
 */
export async function cleanupStreamClient(client: StreamVideoClient | null): Promise<void> {
    if (client) {
        try {
            await client.disconnectUser();
        } catch (error) {
            console.error('Error disconnecting Stream client:', error);
        }
    }
}

/**
 * Generate a simple random call ID (alternative to uuid)
 */
export function generateSimpleCallId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
