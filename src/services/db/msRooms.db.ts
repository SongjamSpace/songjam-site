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
} from 'firebase/firestore';

export interface MSRoom {
    id: string;
    hostId: string;
    hostName: string;
    roomId: string; // 100ms room ID
    state: 'active' | 'ended';
    createdAt: number;
    endedAt?: number;
}

export interface SpeakerRequest {
    id: string;
    roomId: string;
    userId: string;
    userName: string;
    peerId: string; // 100ms peer ID
    status: 'pending' | 'approved' | 'denied';
    createdAt: number;
}

const MS_ROOMS_COLLECTION = 'msRooms';
const SPEAKER_REQUESTS_COLLECTION = 'speakerRequests';

/**
 * Create a new active room
 */
export async function createMSRoom(
    hostId: string,
    hostName: string,
    roomId: string
): Promise<MSRoom> {
    try {
        const roomDoc = {
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
 * Get the currently active room (there should only be one)
 */
export async function getActiveRoom(): Promise<MSRoom | null> {
    try {
        const roomsRef = collection(db, MS_ROOMS_COLLECTION);
        const q = query(
            roomsRef,
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
        const requestsRef = collection(db, SPEAKER_REQUESTS_COLLECTION);
        const q = query(requestsRef, where('roomId', '==', roomId));
        const querySnapshot = await getDocs(q);

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
 * Subscribe to active room changes
 */
export function subscribeToActiveRoom(
    callback: (room: MSRoom | null) => void
): () => void {
    const roomsRef = collection(db, MS_ROOMS_COLLECTION);
    const q = query(
        roomsRef,
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
        const requestsRef = collection(db, SPEAKER_REQUESTS_COLLECTION);
        const q = query(
            requestsRef,
            where('roomId', '==', roomId),
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

        const docRef = await addDoc(
            collection(db, SPEAKER_REQUESTS_COLLECTION),
            requestDoc
        );

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
    requestId: string,
    status: 'approved' | 'denied'
): Promise<void> {
    try {
        const docRef = doc(db, SPEAKER_REQUESTS_COLLECTION, requestId);
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
        const requestsRef = collection(db, SPEAKER_REQUESTS_COLLECTION);
        const q = query(
            requestsRef,
            where('roomId', '==', roomId),
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
export async function deleteSpeakerRequest(requestId: string): Promise<void> {
    try {
        const docRef = doc(db, SPEAKER_REQUESTS_COLLECTION, requestId);
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
    const requestsRef = collection(db, SPEAKER_REQUESTS_COLLECTION);
    const q = query(
        requestsRef,
        where('roomId', '==', roomId),
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
