
export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  isStreaming?: boolean;
  groundingUrls?: Array<{ uri: string; title: string }>;
  images?: string[]; // base64
}

export enum AppMode {
  CHAT = 'chat',
  LIVE = 'live',
  IMAGE = 'image',
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface StarterChip {
  label: string;
  prompt: string;
}

// Live API Types
export interface LiveConfig {
  voiceName: string;
  language?: string;
  responseStyle?: string;
}

// History Types
export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt?: number;
}
