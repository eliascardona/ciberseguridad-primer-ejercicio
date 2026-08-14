import { MessagingActionEnum, type MessageSavingRequestBody } from '~/lib/chat/request-types';

export function formatDataIntoRequestMessageSaving(
  data: {
    message: string;
  }
) {
  const format: MessageSavingRequestBody = {
    intent: MessagingActionEnum.enum.REQUEST_MESSAGE_SAVING,
    body: {
      message: data.message
    },
  };

  return format;
}
