import type { AvailableUsername } from '../shared/types';

export type ChatMessageStatus = 'PENDING_VERIFICATION' | 'VERIFIED';

export type ChatMessage = {
  id: string;
  content: string;
  status: ChatMessageStatus;
};

export type ChatPhase =
  | 'IDLE'
  | 'CREATING'
  | 'PENDING_VERIFICATION'
  | 'VERIFYING'
  | 'VERIFIED';

export type ChatState = {
  username: AvailableUsername;

  phase: ChatPhase;

  draftMessage: string;

  activeMessageId: string | null;

  messages: ChatMessage[];
};
