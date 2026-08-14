import { type ApiClient } from '../infrastructure/api/client';
import type { SaveMessageCommand, VerifyMessageCommand } from './request-types';
import type {
  SavedMessageResponseDto,
  VerifiedMessageResponseDto,
} from './response-types';

export async function saveMessage(
  command: SaveMessageCommand,
  client: ApiClient
): Promise<SavedMessageResponseDto> {
  try {
    const response = await client.post<SavedMessageResponseDto>(
      `/chat/save-message`,
      command
    );

    return response;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}

export async function verifyMessage(
  command: VerifyMessageCommand,
  client: ApiClient
): Promise<VerifiedMessageResponseDto> {
  try {
    const response = await client.get<VerifiedMessageResponseDto>(
      `/chat/verify-message`,
      {},
      { chatMessageId: command.chatMessageId }
    );

    return response;
  } catch (error) {
    console.error('Error verifying message:', error);
    throw error;
  }
}
