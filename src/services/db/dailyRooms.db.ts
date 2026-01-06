
import { db } from '../firebase.service';
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    increment,
    Timestamp,
    QuerySnapshot,
    DocumentData,
} from 'firebase/firestore';

export interface DailyRoom {
    id: string;
    title: string;
    description: string;
    hostId: string;
    hostName: string;
    hostUsername: string;
    dailyRoomUrl: string;
    state: 'Live' | 'Ended';
    createdAt: number;
    endedAt?: number;
    participantCount: number;
}

export interface CreateDailyRoomData {
    title: string;
    description: string;
    hostId: string;
    hostName: string;
    hostUsername: string;
    dailyRoomUrl: string;
}

export interface SpeakerRequest {
    id: string;
    roomId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    status: 'pending' | 'approved' | 'denied';
    createdAt: number;
}

const DAILY_ROOMS_COLLECTION = 'daily_rooms';
const SPEAKER_REQUESTS_SUBCOLLECTION = 'requests';

/**
 * Create a new Daily room in Firestore
 */
export async function createDailyRoom(roomData: CreateDailyRoomData): Promise<DailyRoom> {
    try {
        const roomDoc = {
            ...roomData,
            state: 'Live' as const,
            createdAt: Date.now(),
            participantCount: 1, // Host is the first participant
        };

        const docRef = await addDoc(collection(db, DAILY_ROOMS_COLLECTION), roomDoc);

        return {
            id: docRef.id,
            ...roomDoc,
        } as DailyRoom;
    } catch (error) {
        console.error('Error creating Daily room:', error);
        throw new Error('Failed to create room');
    }
}

/**
 * Get a single Daily room by ID
 */
export async function getDailyRoomById(roomId: string): Promise<DailyRoom | null> {
    try {
        const docRef = doc(db, DAILY_ROOMS_COLLECTION, roomId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
            } as DailyRoom;
        }

        return null;
    } catch (error) {
        console.error('Error getting Daily room:', error);
        throw new Error('Failed to fetch room');
    }
}

/**
 * Update Daily room status
 */
export async function updateDailyRoomStatus(
    roomId: string,
    state: 'Live' | 'Ended'
): Promise<void> {
    try {
        const docRef = doc(db, DAILY_ROOMS_COLLECTION, roomId);
        const updateData: any = { state };

        if (state === 'Ended') {
            updateData.endedAt = Date.now();
        }

        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error('Error updating Daily room status:', error);
        throw new Error('Failed to update room status');
    }
}

// --- Speaker Requests ---

/**
 * Add a speaker request
 */
export async function addSpeakerRequest(
    roomId: string,
    userId: string,
    userName: string,
    userAvatar?: string
): Promise<SpeakerRequest> {
    try {
        const requestsRef = collection(db, DAILY_ROOMS_COLLECTION, roomId, SPEAKER_REQUESTS_SUBCOLLECTION);
        // Check for existing pending request
        const q = query(
            requestsRef,
            where('userId', '==', userId),
            where('status', '==', 'pending')
        );
        const existing = await getDocs(q);

        if (!existing.empty) {
            const doc = existing.docs[0];
            return {
                id: doc.id,
                ...doc.data(),
            } as SpeakerRequest;
        }

        const requestDoc = {
            roomId,
            userId,
            userName,
            userAvatar: userAvatar || '',
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
 * Subscribe to speaker requests for a room
 */
export function subscribeToSpeakerRequests(
    roomId: string,
    callback: (requests: SpeakerRequest[]) => void
): () => void {
    const requestsRef = collection(db, DAILY_ROOMS_COLLECTION, roomId, SPEAKER_REQUESTS_SUBCOLLECTION);
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

/**
 * Update speaker request status
 */
export async function updateSpeakerRequestStatus(
    roomId: string,
    requestId: string,
    status: 'approved' | 'denied'
): Promise<void> {
    try {
        const docRef = doc(db, DAILY_ROOMS_COLLECTION, roomId, SPEAKER_REQUESTS_SUBCOLLECTION, requestId);
        await updateDoc(docRef, { status });
    } catch (error) {
        console.error('Error updating speaker request:', error);
        throw new Error('Failed to update speaker request');
    }
}
