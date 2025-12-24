import { db } from '../firebase.service';
import { doc, getDoc, setDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';

export interface UserPointsDoc {
    totalPoints: number;
    spaceHistory: {
        [spaceId: string]: {
            points: number;
            sessions: {
                joinedAt: number;
                leftAt: number;
            }[];
        }
    };
}

export const POINTS_COLLECTION = 'songjam_space_points';

/**
 * Saves or updates user points for a specific space session.
 * @param userId - The Twitter ID of the user (or other unique ID).
 * @param spaceId - The ID of the space.
 * @param points - The points earned in this session.
 * @param role - The role of the user (host/speaker/listener).
 * @param joinedAt - Timestamp when user joined.
 */
export const saveUserPoints = async (
    userId: string,
    spaceId: string,
    points: number,
    role: string,
    joinedAt: number
) => {
    if (!userId || !spaceId || points <= 0) return;

    const userRef = doc(db, POINTS_COLLECTION, userId);
    const leftAt = Date.now();

    try {
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            // Update total points and specific space points (accumulate)
            // Also update metadata to the latest session info
            await updateDoc(userRef, {
                totalPoints: increment(points),
                [`spaceHistory.${spaceId}.points`]: increment(points),
                [`spaceHistory.${spaceId}.sessions`]: arrayUnion({ joinedAt, leftAt })
            });

        } else {
            // New user doc
            const newData: UserPointsDoc = {
                totalPoints: points,
                spaceHistory: {
                    [spaceId]: {
                        points,
                        sessions: [{ joinedAt, leftAt }]
                    }
                }
            };
            await setDoc(userRef, newData);
        }
    } catch (error) {
        console.error("Error saving user points:", error);
    }
};

/**
 * Fetch total points for a user.
 */
export const getUserPoints = async (userId: string): Promise<number> => {
    if (!userId) return 0;
    try {
        const userRef = doc(db, POINTS_COLLECTION, userId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            return docSnap.data().totalPoints || 0;
        }
    } catch (error) {
        console.error("Error fetching user points:", error);
    }
    return 0;
};
