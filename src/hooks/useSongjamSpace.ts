"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  FarcasterCast,
  InviteTarget,
  Participant,
  TranscriptMessage,
  generateMockCast,
  generateMockInviteTarget,
  generateMockTranscriptMessage,
  generateInitialMockData
} from '@/lib/songjam/mockData';
import axios from 'axios';

export type SpaceViewState = 'listening' | 'transitioning' | 'live';

interface SongjamSpaceState {
  viewState: SpaceViewState;
  roomUrl: string | null;
  participants: Participant[];
  inviteTargets: InviteTarget[];
  radarCasts: FarcasterCast[];
  transcript: TranscriptMessage[];
  inviteProgress: { current: number; total: number };
}

export const useSongjamSpace = () => {
  const [state, setState] = useState<SongjamSpaceState>({
    viewState: 'listening',
    roomUrl: null,
    participants: [],
    inviteTargets: [],
    radarCasts: [],
    transcript: [],
    inviteProgress: { current: 0, total: 10 }
  });

  const intervalsRef = useRef<NodeJS.Timeout[]>([]);

  // Start the space - called by ElevenLabs client tool
  const startSpace = useCallback(async () => {
    setState(prev => ({ ...prev, viewState: 'transitioning' }));

    try {
      // Mock API call to create room
      const response = await axios.post('/api/create-room', {
        title: 'Songjam Live Space',
        description: 'AI-powered social discovery'
      });

      const { roomUrl } = response.data;

      // Initialize with mock data
      const initialData = generateInitialMockData();

      // Short delay for transition animation
      await new Promise(resolve => setTimeout(resolve, 1500));

      setState(prev => ({
        ...prev,
        viewState: 'live',
        roomUrl,
        ...initialData,
        inviteProgress: { current: initialData.inviteTargets.length, total: 10 }
      }));

      return { success: true, roomUrl };
    } catch (error) {
      console.error('Failed to create space:', error);
      setState(prev => ({ ...prev, viewState: 'listening' }));
      return { success: false, error };
    }
  }, []);

  // Start mock data streams when space is live
  useEffect(() => {
    if (state.viewState !== 'live') return;

    // Add new radar casts every 3-5 seconds
    const castInterval = setInterval(() => {
      const newCast = generateMockCast();
      setState(prev => ({
        ...prev,
        radarCasts: [...prev.radarCasts.slice(-8), newCast] // Keep last 9 casts
      }));
    }, 3000 + Math.random() * 2000);

    // Update invite targets status every 4-6 seconds
    const inviteInterval = setInterval(() => {
      setState(prev => {
        // Progress existing targets
        const updatedTargets = prev.inviteTargets.map(target => {
          if (target.status === 'searching') return { ...target, status: 'found' as const };
          if (target.status === 'found') return { ...target, status: 'inviting' as const };
          if (target.status === 'inviting' && Math.random() > 0.5) {
            return { ...target, status: 'joined' as const };
          }
          return target;
        });

        // Maybe add a new target
        const shouldAddNew = updatedTargets.length < 10 && Math.random() > 0.6;
        const newTargets = shouldAddNew
          ? [...updatedTargets, generateMockInviteTarget()]
          : updatedTargets;

        const joinedCount = newTargets.filter(t => t.status === 'joined').length;

        return {
          ...prev,
          inviteTargets: newTargets,
          inviteProgress: { current: joinedCount, total: 10 }
        };
      });
    }, 4000 + Math.random() * 2000);

    // Add transcript messages every 5-8 seconds
    const transcriptInterval = setInterval(() => {
      setState(prev => {
        const speakers = prev.participants.map(p => p.displayName);
        const newMessage = generateMockTranscriptMessage(speakers);
        return {
          ...prev,
          transcript: [...prev.transcript.slice(-50), newMessage] // Keep last 51 messages
        };
      });
    }, 5000 + Math.random() * 3000);

    // Toggle random participant speaking
    const speakingInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        participants: prev.participants.map(p => ({
          ...p,
          isSpeaking: Math.random() > 0.7
        }))
      }));
    }, 2000);

    intervalsRef.current = [castInterval, inviteInterval, transcriptInterval, speakingInterval];

    return () => {
      intervalsRef.current.forEach(clearInterval);
    };
  }, [state.viewState]);

  // End the space
  const endSpace = useCallback(() => {
    intervalsRef.current.forEach(clearInterval);
    setState({
      viewState: 'listening',
      roomUrl: null,
      participants: [],
      inviteTargets: [],
      radarCasts: [],
      transcript: [],
      inviteProgress: { current: 0, total: 10 }
    });
  }, []);

  // Remove a cast from radar (after it's been "collected")
  const collectCast = useCallback((castId: string) => {
    setState(prev => ({
      ...prev,
      radarCasts: prev.radarCasts.filter(c => c.id !== castId)
    }));
  }, []);

  return {
    ...state,
    startSpace,
    endSpace,
    collectCast
  };
};
