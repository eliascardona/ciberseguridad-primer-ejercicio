import {
  MessagingActionEnum,
  type SaveMessageRequestBody,
  type VerifyMessageRequestBody,
} from '~/lib/chat/request-types';

export function formatDataIntoSaveMessageRequest(data: { message: string }) {
  const format: SaveMessageRequestBody = {
    intent: MessagingActionEnum.enum.REQUEST_MESSAGE_SAVING,
    body: {
      message: data.message,
    },
  };

  return format;
}

export function formatDataIntoVerifyMessageRequest(data: {
  chatMessageId: string;
}) {
  const format: VerifyMessageRequestBody = {
    intent: MessagingActionEnum.enum.REQUEST_MESSAGE_VERIFICATION,
    body: {
      chatMessageId: data.chatMessageId,
    },
  };

  return format;
}
