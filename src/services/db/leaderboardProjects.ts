import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../firebase.service";

const LEADERBOARD_PROJECTS_COLLECTION = 'leaderboard_projects';

export const getLatestCountAndTimestamp = async (projectId: string): Promise<{ count: number; timestamp: number }> => {

    const q = query(collection(db, LEADERBOARD_PROJECTS_COLLECTION, projectId, 'snapshots'), orderBy('createdAt', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    const doc = querySnapshot.docs[0];

    return {
        count: doc.data().usersCount,
        timestamp: doc.data().createdAt,
    };
}

const AUDIOFI_PROJECTS_COLLECTION = 'audiofi_projects';

export const getAudiofiLatestCountAndTimestamp = async (projectId: string): Promise<{ count: number; timestamp: number }> => {

    const q = query(collection(db, AUDIOFI_PROJECTS_COLLECTION, projectId, 'snapshots'), orderBy('createdAt', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    const doc = querySnapshot.docs[0];

    return {
        count: doc.data().count,
        timestamp: doc.data().createdAt,
    };
}