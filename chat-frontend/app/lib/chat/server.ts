import { MessagingActionEnum, type MessagingRequestBody } from './request-types';
import { apiClient } from '../infrastructure/api/client';
import { saveMessage } from './api';

export async function shoppingServerActionHandler(
  requestBody: MessagingRequestBody,
) {
  const intent = requestBody.intent;

  if (!requestBody) return null;

  try {
    switch (intent) {

      case MessagingActionEnum.enum.REQUEST_MESSAGE_SAVING: {
        const savedMessage = saveMessage(
          requestBody.body,
          apiClient
        );
      }

      default:
        return {
          success: false,
          message: 'Invalid chat messaging action intent',
        };
    }
  } catch (error: any) {
    console.error(
      'Error performing chat messaging action:',
      error.message || 'null'
    );
    return null;
  }
}
