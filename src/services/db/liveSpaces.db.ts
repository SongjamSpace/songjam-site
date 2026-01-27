import { db } from '../firebase.service';
import {
    collection,
    addDoc,
    getDoc,
    doc,
    setDoc,
    updateDoc,
    onSnapshot,
    query,
    where,
    Unsubscribe,
} from 'firebase/firestore';

// Main document for a host's live space status
export interface LiveSpaceDoc {
    hostSlug: string;           // Farcaster username (also the doc ID)
    hostFid: string;            // Host's Farcaster ID for verification
    state: 'Live' | 'Offline';
    currentSessionId?: string;  // Reference to active session in subcollection
    dailyRoomUrl?: string;      // Current room URL when live
    participantCount: number;
    lastUpdated: number;
}

// Session record in the subcollection (historical data)
export interface SpaceSession {
    id: string;
    dailyRoomUrl: string;
    startedAt: number;
    endedAt?: number;
    peakParticipants: number;
}

export interface CreateLiveSpaceData {
    hostSlug: string;
    hostFid: string;
    dailyRoomUrl: string;
}

const LIVE_SPACES_COLLECTION = 'live_spaces';
const SESSIONS_SUBCOLLECTION = 'sessions';

/**
 * Go live - updates the host's document and creates a new session
 * Uses hostSlug as the document ID for direct access
 */
export async function goLive(data: CreateLiveSpaceData): Promise<LiveSpaceDoc> {
    try {
        const docRef = doc(db, LIVE_SPACES_COLLECTION, data.hostSlug);
        
        // Create a new session in the subcollection
        const sessionDoc = {
            dailyRoomUrl: data.dailyRoomUrl,
            startedAt: Date.now(),
            peakParticipants: 1,
        };
        
        const sessionRef = await addDoc(
            collection(db, LIVE_SPACES_COLLECTION, data.hostSlug, SESSIONS_SUBCOLLECTION),
            sessionDoc
        );

        // Update/create the main document
        const liveSpaceDoc: LiveSpaceDoc = {
            hostSlug: data.hostSlug,
            hostFid: data.hostFid,
            state: 'Live',
            currentSessionId: sessionRef.id,
            dailyRoomUrl: data.dailyRoomUrl,
            participantCount: 1,
            lastUpdated: Date.now(),
        };

        await setDoc(docRef, liveSpaceDoc);

        return liveSpaceDoc;
    } catch (error) {
        console.error('Error going live:', error);
        throw new Error('Failed to go live');
    }
}

/**
 * End the space - updates state to Offline and ends the current session
 */
export async function endSpace(hostSlug: string): Promise<void> {
    try {
        const docRef = doc(db, LIVE_SPACES_COLLECTION, hostSlug);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return;
        }

        const data = docSnap.data() as LiveSpaceDoc;

        // End the current session if there is one
        if (data.currentSessionId) {
            const sessionRef = doc(
                db, 
                LIVE_SPACES_COLLECTION, 
                hostSlug, 
                SESSIONS_SUBCOLLECTION, 
                data.currentSessionId
            );
            await updateDoc(sessionRef, {
                endedAt: Date.now(),
            });
        }

        // Update main document to offline
        await updateDoc(docRef, {
            state: 'Offline',
            currentSessionId: null,
            dailyRoomUrl: null,
            participantCount: 0,
            lastUpdated: Date.now(),
        });
    } catch (error) {
        console.error('Error ending space:', error);
        throw new Error('Failed to end space');
    }
}

/**
 * Get the live space document for a host - direct document read (no query needed)
 */
export async function getLiveSpace(hostSlug: string): Promise<LiveSpaceDoc | null> {
    try {
        const docRef = doc(db, LIVE_SPACES_COLLECTION, hostSlug);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return {
            hostSlug,
            ...docSnap.data(),
        } as LiveSpaceDoc;
    } catch (error) {
        console.error('Error getting live space:', error);
        throw new Error('Failed to get live space');
    }
}

/**
 * Check if a host is currently live - simple boolean check
 */
export async function isHostLive(hostSlug: string): Promise<boolean> {
    const space = await getLiveSpace(hostSlug);
    return space?.state === 'Live';
}

/**
 * Update participant count
 */
export async function updateParticipantCount(hostSlug: string, count: number): Promise<void> {
    try {
        const docRef = doc(db, LIVE_SPACES_COLLECTION, hostSlug);
        await updateDoc(docRef, {
            participantCount: count,
            lastUpdated: Date.now(),
        });
    } catch (error) {
        console.error('Error updating participant count:', error);
    }
}

/**
 * Subscribe to real-time updates for a host's live space
 * Returns an unsubscribe function
 */
export function subscribeToLiveSpace(
    hostSlug: string,
    callback: (liveSpace: LiveSpaceDoc | null) => void
): Unsubscribe {
    const docRef = doc(db, LIVE_SPACES_COLLECTION, hostSlug);

    return onSnapshot(
        docRef,
        (docSnap) => {
            if (!docSnap.exists()) {
                callback(null);
                return;
            }

            const data = docSnap.data() as LiveSpaceDoc;
            
            // Only return as "live" if state is Live
            if (data.state === 'Live') {
                callback(data);
            } else {
                callback(null);
            }
        },
        (error) => {
            console.error('Error in live space subscription:', error);
            callback(null);
        }
    );
}

/**
 * Subscribe to all live spaces in real-time
 * Returns an unsubscribe function
 */
export function subscribeToAllLiveSpaces(
    callback: (liveSpaces: LiveSpaceDoc[]) => void
): Unsubscribe {
    const liveSpacesQuery = query(
        collection(db, LIVE_SPACES_COLLECTION),
        where('state', '==', 'Live')
    );

    return onSnapshot(
        liveSpacesQuery,
        (snapshot) => {
            const spaces: LiveSpaceDoc[] = [];
            snapshot.forEach((docSnap) => {
                spaces.push(docSnap.data() as LiveSpaceDoc);
            });
            callback(spaces);
        },
        (error) => {
            console.error('Error in all live spaces subscription:', error);
            callback([]);
        }
    );
}

// ============ Legacy function names for backward compatibility ============

/** @deprecated Use goLive instead */
export const createLiveSpace = goLive;

/** @deprecated Use endSpace instead */
export async function updateLiveSpaceState(spaceId: string, state: 'Live' | 'Ended'): Promise<void> {
    if (state === 'Ended') {
        await endSpace(spaceId);
    }
}

/** @deprecated Use getLiveSpace instead */
export const getLiveSpaceByHostSlug = getLiveSpace;
