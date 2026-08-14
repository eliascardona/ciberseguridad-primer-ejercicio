import { apiClient, type ApiClient } from '../infrastructure/api/client';
import type { SaveMessageCommand } from './request-types';
import type { SavedMessageResponseDto } from './response-types';

export async function saveMessage(
  command: SaveMessageCommand,
  client: ApiClient
): Promise<SavedMessageResponseDto> {
  try {
    const response = await apiClient.post<SavedMessageResponseDto>(
      `/chat/save-message`,
      command
    );

    return response;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}
