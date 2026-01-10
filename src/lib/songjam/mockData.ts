"use client";

// Mock Farcaster Cast data
export interface FarcasterCast {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  text: string;
  timestamp: Date;
  likes: number;
  recasts: number;
}

// Mock Invite Target data
export interface InviteTarget {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  status: 'searching' | 'found' | 'inviting' | 'joined';
  foundAt?: Date;
}

// Mock Participant data
export interface Participant {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  isSpeaking: boolean;
  isHost: boolean;
}

// Mock Transcript Message
export interface TranscriptMessage {
  id: string;
  speaker: string;
  text: string;
  timestamp: Date;
}

// Sample usernames for mock data
const MOCK_USERNAMES = [
  'vitalik.eth', 'jessepollak', 'dwr.eth', 'balajis', 'naval',
  'sassal.eth', 'punk6529', 'gmoney.eth', 'coopahtroopa', 'linda.eth',
  'cdixon', 'fredwilson', 'garyvee', 'messari', 'bankless'
];

const MOCK_DISPLAY_NAMES = [
  'Vitalik Buterin', 'Jesse Pollak', 'Dan Romero', 'Balaji', 'Naval',
  'Sassal', 'Punk6529', 'GMoney', 'Coopahtroopa', 'Linda Xie',
  'Chris Dixon', 'Fred Wilson', 'Gary Vee', 'Messari', 'Bankless'
];

const MOCK_CASTS = [
  "Just shipped a major update to the protocol. LFG! 🚀",
  "The future of social is onchain. Change my mind.",
  "GM to everyone building in the bear market 🐻",
  "Web3 social is so underrated right now",
  "Who else is excited about the Farcaster ecosystem?",
  "Building in public > building in private",
  "The attention economy is broken. Let's fix it.",
  "Decentralized identity is the next frontier",
  "Bullish on creator ownership 📈",
  "This space is going to be huge in 2025",
  "Interoperability is key to mass adoption",
  "Community first, always",
  "AI + Crypto = The future of coordination",
  "Voice spaces are criminally underrated",
  "The social layer of crypto needs more love"
];

const MOCK_TRANSCRIPT = [
  "Hey everyone, welcome to the space!",
  "Thanks for having me, excited to be here",
  "Let's dive into today's topic",
  "I think the key insight here is...",
  "That's a great point about decentralization",
  "What are your thoughts on this?",
  "I've been building in this space for years now",
  "The community response has been incredible",
  "We should definitely explore that further",
  "Anyone have questions so far?"
];

// Utility to get random item from array
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Generate random avatar URL
const getAvatarUrl = (username: string) => `https://unavatar.io/twitter/${username.replace('.eth', '')}`;

// Generate mock Farcaster cast
export const generateMockCast = (): FarcasterCast => {
  const usernameIndex = Math.floor(Math.random() * MOCK_USERNAMES.length);
  return {
    id: generateId(),
    username: MOCK_USERNAMES[usernameIndex],
    displayName: MOCK_DISPLAY_NAMES[usernameIndex],
    avatarUrl: getAvatarUrl(MOCK_USERNAMES[usernameIndex]),
    text: getRandomItem(MOCK_CASTS),
    timestamp: new Date(),
    likes: Math.floor(Math.random() * 500),
    recasts: Math.floor(Math.random() * 100)
  };
};

// Generate mock invite target
export const generateMockInviteTarget = (): InviteTarget => {
  const usernameIndex = Math.floor(Math.random() * MOCK_USERNAMES.length);
  return {
    id: generateId(),
    username: MOCK_USERNAMES[usernameIndex],
    displayName: MOCK_DISPLAY_NAMES[usernameIndex],
    avatarUrl: getAvatarUrl(MOCK_USERNAMES[usernameIndex]),
    status: 'searching'
  };
};

// Generate mock participant
export const generateMockParticipant = (isHost = false): Participant => {
  const usernameIndex = Math.floor(Math.random() * MOCK_USERNAMES.length);
  return {
    id: generateId(),
    username: MOCK_USERNAMES[usernameIndex],
    displayName: MOCK_DISPLAY_NAMES[usernameIndex],
    avatarUrl: getAvatarUrl(MOCK_USERNAMES[usernameIndex]),
    isSpeaking: Math.random() > 0.7,
    isHost
  };
};

// Generate mock transcript message
export const generateMockTranscriptMessage = (speakers: string[]): TranscriptMessage => {
  return {
    id: generateId(),
    speaker: getRandomItem(speakers.length > 0 ? speakers : ['Host']),
    text: getRandomItem(MOCK_TRANSCRIPT),
    timestamp: new Date()
  };
};

// Generate initial mock data set
export const generateInitialMockData = () => {
  const participants: Participant[] = [
    generateMockParticipant(true), // Host
    ...Array.from({ length: 4 }, () => generateMockParticipant())
  ];

  const inviteTargets: InviteTarget[] = Array.from({ length: 3 }, () => ({
    ...generateMockInviteTarget(),
    status: 'found' as const
  }));

  const casts: FarcasterCast[] = Array.from({ length: 3 }, generateMockCast);

  const transcript: TranscriptMessage[] = Array.from({ length: 5 }, () =>
    generateMockTranscriptMessage(participants.map(p => p.displayName))
  );

  return { participants, inviteTargets, casts, transcript };
};
