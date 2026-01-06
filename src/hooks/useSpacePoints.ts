import { useState, useEffect, useRef } from 'react';
import { saveUserPoints, getUserPoints } from '@/services/db/points.db';

interface UseSpacePointsProps {
    userId?: string;
    userName?: string;
    spaceId?: string;
    projectId?: string;
    role?: 'host' | 'speaker' | 'listener';
    isSpeaking?: boolean; // Signal for "actually speaking"
    isConnected?: boolean;
}

export const useSpacePoints = ({
    userId,
    userName = 'User',
    spaceId,
    projectId = 'unknown',
    role = 'listener',
    isSpeaking = false,
    isConnected = false
}: UseSpacePointsProps) => {
    const [totalPoints, setTotalPoints] = useState(0); // From DB
    const [sessionPoints, setSessionPoints] = useState(0); // Gained this session
    const joinedAtRef = useRef<number>(Date.now());
    const savedRef = useRef(false);
    const sessionPointsRef = useRef(0);

    // Sync ref with state
    useEffect(() => {
        sessionPointsRef.current = sessionPoints;
    }, [sessionPoints]);

    // Fetch initial total points
    useEffect(() => {
        if (userId) {
            getUserPoints(userId).then(pts => setTotalPoints(pts));
        }
    }, [userId]);

    // Points Timer
    useEffect(() => {
        if (!isConnected || !userId || !spaceId) return;

        const timer = setInterval(() => {
            let pointsToAdd = 1; // Base rate: 1 pt/sec

            // Host gets NO points (as requested "There's no points for the host")
            if (role === 'host') {
                pointsToAdd = 0;
            }
            // Speaker bonus: x2 if speaking
            else if (role === 'speaker' && isSpeaking) {
                pointsToAdd = 2;
            }

            if (pointsToAdd > 0) {
                setSessionPoints(prev => prev + pointsToAdd);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [isConnected, userId, spaceId, role, isSpeaking]);

    // Save on Unmount
    // Save on Unmount
    useEffect(() => {
        // Reset saved ref if connection status changes to true (re-join)
        if (isConnected) {
            savedRef.current = false;
            // Reset joinedAt to now, so this new session has a fresh start time
            joinedAtRef.current = Date.now();
        }

        return () => {
            // Only save if we have points and haven't saved already (though unmount happens once usually)
            // Use ref to get latest points without triggering effect re-run
            const finalPoints = sessionPointsRef.current;
            if (userId && spaceId && finalPoints > 0 && !savedRef.current) {
                saveUserPoints(userId, userName, spaceId, projectId, finalPoints, role, joinedAtRef.current);
                savedRef.current = true;
                setSessionPoints(0);
            }
        };
    }, [userId, spaceId, projectId, role, isConnected]);

    return {
        totalPoints,
        sessionPoints,
        combinedPoints: totalPoints + sessionPoints
    };
};
