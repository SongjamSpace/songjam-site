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
    increment,
    Timestamp,
    QuerySnapshot,
    DocumentData,
} from 'firebase/firestore';

export interface Room {
    id: string;
    title: string;
    description: string;
    hostId: string;
    hostName: string;
    hostUsername: string;
    streamCallId: string;
    state: 'Live' | 'Ended';
    createdAt: number;
    endedAt?: number;
    participantCount: number;
}

export interface CreateRoomData {
    title: string;
    description: string;
    hostId: string;
    hostName: string;
    hostUsername: string;
    streamCallId: string;
}

const ROOMS_COLLECTION = 'rooms';

/**
 * Create a new room in Firestore
 */
export async function createRoom(roomData: CreateRoomData): Promise<Room> {
    try {
        const roomDoc = {
            ...roomData,
            state: 'Live' as const,
            createdAt: Date.now(),
            participantCount: 1, // Host is the first participant
        };

        const docRef = await addDoc(collection(db, ROOMS_COLLECTION), roomDoc);

        return {
            id: docRef.id,
            ...roomDoc,
        };
    } catch (error) {
        console.error('Error creating room:', error);
        throw new Error('Failed to create room');
    }
}

/**
 * Get all rooms, optionally filtered by state
 */
export async function getRooms(state?: 'Live' | 'Ended'): Promise<Room[]> {
    try {
        const roomsRef = collection(db, ROOMS_COLLECTION);
        let q = query(roomsRef, orderBy('createdAt', 'desc'));

        if (state) {
            q = query(roomsRef, where('state', '==', state), orderBy('createdAt', 'desc'));
        }

        const querySnapshot = await getDocs(q);
        const rooms: Room[] = [];

        querySnapshot.forEach((doc) => {
            rooms.push({
                id: doc.id,
                ...doc.data(),
            } as Room);
        });

        return rooms;
    } catch (error) {
        console.error('Error getting rooms:', error);
        throw new Error('Failed to fetch rooms');
    }
}

/**
 * Get a single room by ID
 */
export async function getRoomById(roomId: string): Promise<Room | null> {
    try {
        const docRef = doc(db, ROOMS_COLLECTION, roomId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
            } as Room;
        }

        return null;
    } catch (error) {
        console.error('Error getting room:', error);
        throw new Error('Failed to fetch room');
    }
}

/**
 * Update room status
 */
export async function updateRoomStatus(
    roomId: string,
    state: 'Live' | 'Ended'
): Promise<void> {
    try {
        const docRef = doc(db, ROOMS_COLLECTION, roomId);
        const updateData: any = { state };

        if (state === 'Ended') {
            updateData.endedAt = Date.now();
        }

        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error('Error updating room status:', error);
        throw new Error('Failed to update room status');
    }
}

/**
 * Increment participant count
 */
export async function incrementParticipantCount(roomId: string): Promise<void> {
    try {
        const docRef = doc(db, ROOMS_COLLECTION, roomId);
        await updateDoc(docRef, {
            participantCount: increment(1),
        });
    } catch (error) {
        console.error('Error incrementing participant count:', error);
        throw new Error('Failed to update participant count');
    }
}

/**
 * Decrement participant count
 */
export async function decrementParticipantCount(roomId: string): Promise<void> {
    try {
        const docRef = doc(db, ROOMS_COLLECTION, roomId);
        await updateDoc(docRef, {
            participantCount: increment(-1),
        });
    } catch (error) {
        console.error('Error decrementing participant count:', error);
        throw new Error('Failed to update participant count');
    }
}

/**
 * Subscribe to live rooms with real-time updates
 */
export function subscribeToLiveRooms(
    callback: (rooms: Room[]) => void
): () => void {
    const roomsRef = collection(db, ROOMS_COLLECTION);
    const q = query(
        roomsRef,
        where('state', '==', 'Live'),
        orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
            const rooms: Room[] = [];
            querySnapshot.forEach((doc) => {
                rooms.push({
                    id: doc.id,
                    ...doc.data(),
                } as Room);
            });
            callback(rooms);
        },
        (error) => {
            console.error('Error in live rooms subscription:', error);
        }
    );

    return unsubscribe;
}
