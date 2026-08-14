import { apiClient } from '../infrastructure/api/client';
import type { ServerActionResult } from '../shared/types';
import { saveMessage, verifyMessage } from './api';
import {
  MessagingActionEnum,
  type MessagingRequestBody,
} from './request-types';
import {
  MessagingActionResponseEnum,
  type MessagingActionResponse,
} from './response-types';

export async function chatServerActionHandler(
  requestBody: MessagingRequestBody
): Promise<ServerActionResult<MessagingActionResponse>> {
  const intent = requestBody.intent;

  if (!requestBody) return { success: false };

  try {
    switch (intent) {
      case MessagingActionEnum.enum.REQUEST_MESSAGE_SAVING: {
        const savedMessage = await saveMessage(requestBody.body, apiClient);

        return {
          success: true,
          performedAction: MessagingActionResponseEnum.enum.MESSAGE_SAVED,
          data: savedMessage,
        };
      }

      case MessagingActionEnum.enum.REQUEST_MESSAGE_VERIFICATION: {
        const verifiedMessage = await verifyMessage(
          requestBody.body,
          apiClient
        );

        return {
          success: true,
          performedAction: MessagingActionResponseEnum.enum.MESSAGE_VERIFIED,
          data: verifiedMessage,
        };
      }

      default:
        return { success: false };
    }
  } catch (error: any) {
    console.error(
      'Error performing chat messaging action:',
      error.message || 'null'
    );
    return { success: false };
  }
}
