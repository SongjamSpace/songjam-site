import { db } from '../firebase.service';
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    deleteDoc,
    Timestamp,
    setDoc,
    increment,
    arrayUnion,
} from 'firebase/firestore';

export interface MSRoom {
    id: string;
    projectId: string;
    hostId: string;
    hostName: string;
    roomId: string; // 100ms room ID
    state: 'active' | 'ended';
    createdAt: number;
    endedAt?: number;
    pinnedLink?: string | null;
    pinnedLinks?: PinnedItem[];
    isMusicPlaying?: boolean;
    speakers?: SpeakerDetails[];
}

export interface SpeakerDetails {
    twitterId: string;
    username: string;
    name: string;
    uuid: string; // Often same as twitterId for twitter users, or uid for others
}

export type PinnedItem = string | {
    url?: string;
    // Custom cast properties
    text?: string;
    hash?: string;
    author?: {
        username: string;
        pfp?: string;
        display_name?: string;
        fid?: number;
    };
    media?: {
        type: 'photo' | 'video';
        url: string;
        previewUrl?: string;
    }[];
    timestamp?: number;
    engagement?: {
        likes: number;
        recasts: number;
    }
};

export interface SpeakerRequest {
    id: string;
    roomId: string;
    userId: string;
    userName: string;
    peerId: string; // 100ms peer ID
    status: 'pending' | 'approved' | 'denied';
    createdAt: number;
}

export interface RoomParticipant {
    id: string; // userId
    roomId: string;
    userId: string;
    userName: string;
    avatarUrl?: string;
    role: 'host' | 'speaker' | 'listener';
    joinedAt: number;
}

export interface RoomParticipantHistory extends RoomParticipant {
    leftAt: number;
}

const MS_ROOMS_COLLECTION = 'ms_rooms';
const PARTICIPANTS_COLLECTION = 'ms_room_participants';
const PARTICIPANTS_HISTORY_COLLECTION = 'ms_room_participants_history';
const SPEAKER_REQUESTS_SUBCOLLECTION = 'speaker_requests';

/**
 * Create a new active room
 */
export async function createMSRoom(
    projectId: string,
    hostId: string,
    hostName: string,
    roomId: string
): Promise<MSRoom> {
    try {
        const roomDoc = {
            projectId,
            hostId,
            hostName,
            roomId,
            state: 'active' as const,
            createdAt: Date.now(),
        };

        const docRef = await addDoc(collection(db, MS_ROOMS_COLLECTION), roomDoc);

        return {
            id: docRef.id,
            ...roomDoc,
        };
    } catch (error) {
        console.error('Error creating MS room:', error);
        throw new Error('Failed to create room');
    }
}

/**
 * Get the currently active room for a specific project
 */
export async function getActiveRoom(projectId: string): Promise<MSRoom | null> {
    try {
        const roomsRef = collection(db, MS_ROOMS_COLLECTION);
        const q = query(
            roomsRef,
            where('projectId', '==', projectId),
            where('state', '==', 'active'),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const firstDoc = querySnapshot.docs[0];
        return {
            id: firstDoc.id,
            ...firstDoc.data(),
        } as MSRoom;
    } catch (error) {
        console.error('Error getting active room:', error);
        throw new Error('Failed to fetch active room');
    }
}

/**
 * End a room
 */
export async function endMSRoom(roomId: string): Promise<void> {
    try {
        const docRef = doc(db, MS_ROOMS_COLLECTION, roomId);
        await updateDoc(docRef, {
            state: 'ended',
            endedAt: Date.now(),
        });

        // Also delete all pending speaker requests for this room
        const requestsRef = collection(db, MS_ROOMS_COLLECTION, roomId, SPEAKER_REQUESTS_SUBCOLLECTION);
        const querySnapshot = await getDocs(requestsRef);

        const deletePromises = querySnapshot.docs.map((doc) =>
            deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Error ending room:', error);
        throw new Error('Failed to end room');
    }
}

/**
 * Subscribe to active room changes for a specific project
 */
export function subscribeToActiveRoom(
    projectId: string,
    callback: (room: MSRoom | null) => void
): () => void {
    const roomsRef = collection(db, MS_ROOMS_COLLECTION);
    const q = query(
        roomsRef,
        where('projectId', '==', projectId),
        where('state', '==', 'active'),
        orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
            if (querySnapshot.empty) {
                callback(null);
            } else {
                const firstDoc = querySnapshot.docs[0];
                callback({
                    id: firstDoc.id,
                    ...firstDoc.data(),
                } as MSRoom);
            }
        },
        (error) => {
            console.error('Error in active room subscription:', error);
            callback(null);
        }
    );

    return unsubscribe;
}

/**
 * Add a speaker request
 */
export async function addSpeakerRequest(
    roomId: string,
    userId: string,
    userName: string,
    peerId: string
): Promise<SpeakerRequest> {
    try {
        // Check if request already exists
        const requestsRef = collection(db, MS_ROOMS_COLLECTION, roomId, SPEAKER_REQUESTS_SUBCOLLECTION);
        const q = query(
            requestsRef,
            where('userId', '==', userId),
            where('status', '==', 'pending')
        );
        const existing = await getDocs(q);

        if (!existing.empty) {
            // Update existing request with new peerId if it changed
            const doc = existing.docs[0];
            const data = doc.data();
            if (data.peerId !== peerId) {
                await updateDoc(doc.ref, { peerId });
            }

            return {
                id: doc.id,
                ...data,
                peerId, // Ensure we return the new peerId
            } as SpeakerRequest;
        }

        const requestDoc = {
            roomId,
            userId,
            userName,
            peerId,
            status: 'pending' as const,
            createdAt: Date.now(),
        };

        const docRef = await addDoc(requestsRef, requestDoc);

        return {
            id: docRef.id,
            ...requestDoc,
        };
    } catch (error) {
        console.error('Error adding speaker request:', error);
        throw new Error('Failed to add speaker request');
    }
}

/**
 * Update speaker request status
 */
export async function updateSpeakerRequestStatus(
    roomId: string,
    requestId: string,
    status: 'approved' | 'denied'
): Promise<void> {
    try {
        const docRef = doc(db, MS_ROOMS_COLLECTION, roomId, SPEAKER_REQUESTS_SUBCOLLECTION, requestId);
        await updateDoc(docRef, { status });
    } catch (error) {
        console.error('Error updating speaker request:', error);
        throw new Error('Failed to update speaker request');
    }
}

/**
 * Update speaker request peer ID
 */
export async function updateSpeakerRequestPeerId(
    roomId: string,
    userId: string,
    peerId: string
): Promise<void> {
    try {
        const requestsRef = collection(db, MS_ROOMS_COLLECTION, roomId, SPEAKER_REQUESTS_SUBCOLLECTION);
        const q = query(
            requestsRef,
            where('userId', '==', userId),
            where('status', '==', 'pending')
        );
        const existing = await getDocs(q);

        if (!existing.empty) {
            const docRef = existing.docs[0].ref;
            await updateDoc(docRef, { peerId });
        }
    } catch (error) {
        console.error('Error updating speaker request peer ID:', error);
        // Don't throw here, just log
    }
}

/**
 * Delete a speaker request
 */
export async function deleteSpeakerRequest(roomId: string, requestId: string): Promise<void> {
    try {
        const docRef = doc(db, MS_ROOMS_COLLECTION, roomId, SPEAKER_REQUESTS_SUBCOLLECTION, requestId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting speaker request:', error);
        throw new Error('Failed to delete speaker request');
    }
}

/**
 * Subscribe to speaker requests for a room
 */
export function subscribeToSpeakerRequests(
    roomId: string,
    callback: (requests: SpeakerRequest[]) => void
): () => void {
    const requestsRef = collection(db, MS_ROOMS_COLLECTION, roomId, SPEAKER_REQUESTS_SUBCOLLECTION);
    const q = query(
        requestsRef,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
            const requests: SpeakerRequest[] = [];
            querySnapshot.forEach((doc) => {
                requests.push({
                    id: doc.id,
                    ...doc.data(),
                } as SpeakerRequest);
            });
            callback(requests);
        },
        (error) => {
            console.error('Error in speaker requests subscription:', error);
        }
    );

    return unsubscribe;
}

// --- Participant Management ---

/**
 * Join a room as a participant
 */
export async function joinRoom(
    roomId: string,
    userId: string,
    userName: string,
    role: 'host' | 'speaker' | 'listener',
    avatarUrl?: string
): Promise<void> {
    try {
        // Use a composite ID or just auto-id?
        // Let's use userId as document ID to prevent duplicates easily
        // But wait, user might be in multiple rooms? No, one at a time usually.
        // But to be safe, let's just query or use a subcollection if we wanted strictness.
        // The requirement says "create a collection called ms-room-participants".
        // It doesn't explicitly say it should be a subcollection of ms-rooms, but it "should all the users that join rooms".
        // A top-level collection is fine, but we need to link it to the room.

        const participantDoc: RoomParticipant = {
            id: userId,
            roomId,
            userId,
            userName,
            role,
            avatarUrl,
            joinedAt: Date.now(),
        };

        // We can use a composite key of roomId_userId to allow same user in different rooms (history)
        // or just add to the collection.
        // Let's use addDoc for now to keep it simple, or setDoc with a custom ID if we want to enforce uniqueness per room.
        // Let's use a custom ID: `${roomId}_${userId}`
        const docId = `${roomId}_${userId}`;
        await setDoc(doc(db, PARTICIPANTS_COLLECTION, docId), participantDoc);

    } catch (error) {
        console.error('Error joining room:', error);
        throw new Error('Failed to join room');
    }
}

/**
 * Leave a room
 */
export async function leaveRoom(roomId: string, userId: string): Promise<void> {
    try {
        const docId = `${roomId}_${userId}`;
        const participantRef = doc(db, PARTICIPANTS_COLLECTION, docId);

        // Get current participant data before deleting
        const participantSnap = await getDoc(participantRef);

        if (participantSnap.exists()) {
            const participantData = participantSnap.data() as RoomParticipant;

            // Archive to history collection with leftAt timestamp
            const historyDocId = `${docId}_${Date.now()}`;
            const historyData: RoomParticipantHistory = {
                ...participantData,
                leftAt: Date.now()
            };

            await setDoc(doc(db, PARTICIPANTS_HISTORY_COLLECTION, historyDocId), historyData);
        }

        // Delete from active participants
        await deleteDoc(participantRef);
    } catch (error) {
        console.error('Error leaving room:', error);
        // Don't throw, just log
    }
}

/**
 * Update participant role
 */
export async function updateParticipantRole(
    roomId: string,
    userId: string,
    role: 'host' | 'speaker' | 'listener'
): Promise<void> {
    try {
        const docId = `${roomId}_${userId}`;
        await updateDoc(doc(db, PARTICIPANTS_COLLECTION, docId), { role });
    } catch (error) {
        console.error('Error updating participant role:', error);
    }
}

/**
 * Subscribe to room participants
 */
export function subscribeToRoomParticipants(
    roomId: string,
    callback: (participants: RoomParticipant[]) => void
): () => void {
    const participantsRef = collection(db, PARTICIPANTS_COLLECTION);
    const q = query(
        participantsRef,
        where('roomId', '==', roomId)
    );

    const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
            const participants: RoomParticipant[] = [];
            querySnapshot.forEach((doc) => {
                participants.push(doc.data() as RoomParticipant);
            });
            callback(participants);
        },
        (error) => {
            console.error('Error in participants subscription:', error);
        }
    );

    return unsubscribe;
}



/**
 * Add a pinned link to a room
 */
export async function addPinnedLink(
    roomId: string,
    item: PinnedItem
): Promise<void> {
    try {
        const docRef = doc(db, MS_ROOMS_COLLECTION, roomId);
        const roomSnap = await getDoc(docRef);
        if (roomSnap.exists()) {
            const currentLinks: PinnedItem[] = roomSnap.data().pinnedLinks || [];

            const newItemUrl = typeof item === 'string' ? item : item.url;

            // Check for duplicate URL
            const exists = currentLinks.some(link => {
                const linkUrl = typeof link === 'string' ? link : link.url;
                return linkUrl === newItemUrl;
            });

            if (!exists) {
                await updateDoc(docRef, {
                    pinnedLinks: [...currentLinks, item]
                });
            }
        }
    } catch (error) {
        console.error('Error adding pinned link:', error);
    }
}

/**
 * Remove a pinned link from a room
 */
export async function removePinnedLink(
    roomId: string,
    linkUrlToRemove: string
): Promise<void> {
    try {
        const docRef = doc(db, MS_ROOMS_COLLECTION, roomId);
        const roomSnap = await getDoc(docRef);
        if (roomSnap.exists()) {
            const currentLinks: PinnedItem[] = roomSnap.data().pinnedLinks || [];
            await updateDoc(docRef, {
                pinnedLinks: currentLinks.filter((link) => {
                    const url = typeof link === 'string' ? link : link.url;
                    return url !== linkUrlToRemove;
                })
            });
        }
    } catch (error) {
        console.error('Error removing pinned link:', error);
    }
}

/**
 * Increment user bonus points
 */
export async function incrementUserBonusPoints(
    twitterId: string,
    points: number,
    data: {
        twitterHandle: string;
        projectId: string;
        fid?: string;
        farcasterHandle?: string;
        tweetId?: string;
    }
): Promise<void> {
    try {
        const USER_BONUS_POINTS_COLLECTION = 'user_bonus_points';
        const docRef = doc(db, USER_BONUS_POINTS_COLLECTION, twitterId);

        await setDoc(docRef, {
            bonusPoints: increment(points),
            twitterId: twitterId,
            twitterHandle: data.twitterHandle,
            projectId: data.projectId,
            fid: data.fid || '',
            farcasterHandle: data.farcasterHandle || '',
            lastUpdated: Date.now(),
            tweetIds: arrayUnion(data.tweetId || ''),
        }, { merge: true });

    } catch (error) {
        console.error('Error incrementing user bonus points:', error);
        throw error;
    }
}

/**
 * Update room music playing status
 */
export async function updateRoomMusicStatus(
    roomId: string,
    isMusicPlaying: boolean
): Promise<void> {
    try {
        const docRef = doc(db, MS_ROOMS_COLLECTION, roomId);
        await updateDoc(docRef, { isMusicPlaying });
    } catch (error) {
        console.error('Error updating room music status:', error);
        // Don't throw, just log
    }
}

/**
 * Add a speaker to the room's speakers list
 */
export async function addSpeakerToRoom(
    roomId: string,
    speaker: SpeakerDetails
): Promise<void> {
    try {
        const docRef = doc(db, MS_ROOMS_COLLECTION, roomId);
        await updateDoc(docRef, {
            speakers: arrayUnion(speaker)
        });
    } catch (error) {
        console.error('Error adding speaker to room:', error);
        // Don't throw, just log
    }
}

