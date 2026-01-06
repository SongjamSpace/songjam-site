import { db } from '../firebase.service';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    getAggregateFromServer, 
    sum 
} from 'firebase/firestore';

export interface SpaceSessionPointDoc {
    userId: string;
    username: string;
    spaceId: string;
    projectId: string;
    points: number;
    role: string;
    joinedAt: number;
    leftAt: number;
    createdAt: number;
}

export const POINTS_COLLECTION = 'space_participant_points';

/**
 * Saves a new session document with points earned.
 */
export const saveUserPoints = async (
    userId: string,
    username: string,
    spaceId: string,
    projectId: string,
    points: number,
    role: string,
    joinedAt: number
) => {
    if (!userId || !spaceId || points <= 0) return;

    try {
        const leftAt = Date.now();
        const createdAt = Date.now();

        const sessionData: SpaceSessionPointDoc = {
            userId,
            username,
            spaceId,
            projectId,
            points,
            role,
            joinedAt,
            leftAt,
            createdAt
        };

        await addDoc(collection(db, POINTS_COLLECTION), sessionData);
        // console.log(`Points saved for ${username}: ${points}`);

    } catch (error) {
        console.error("Error saving user points:", error);
    }
};

/**
 * Fetch total points for a user by aggregating all session documents.
 */
export const getUserPoints = async (userId: string): Promise<number> => {
    if (!userId) return 0;
    try {
        const coll = collection(db, POINTS_COLLECTION);
        const q = query(coll, where('userId', '==', userId));
        
        const snapshot = await getAggregateFromServer(q, {
            totalPoints: sum('points')
        });

        return snapshot.data().totalPoints;

    } catch (error) {
        console.error("Error fetching user points:", error);
        return 0;
    }
};
