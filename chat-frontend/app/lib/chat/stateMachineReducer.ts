export type ChatMessageStatus = 'PENDING_VERIFICATION' | 'VERIFIED';

export type ChatMessage = {
  id: string;
  content: string;
  status: ChatMessageStatus;
};

export type ExecutionFlags = {
  messageCreationCommandIssued: boolean;
  messageVerificationCommandIssued: boolean;
};

export type ChatPhase =
  | 'INIT'
  | 'CREATING_MESSAGE'
  | 'MESSAGE_CREATED'
  | 'VERIFYING_MESSAGE'
  | 'MESSAGE_VERIFIED';

export type ChatState = {
  phase: ChatPhase;

  draftMessage?: string;
  activeMessageId?: string;

  messages: ChatMessage[];

  execution: ExecutionFlags;
};

export type ChatEvent =
  | {
      type: 'START';
    }
  | {
      type: 'SEND_MESSAGE';
      draftMessage: string;
    }
  | {
      type: 'MESSAGE_CREATION_COMMAND_ISSUED';
    }
  | {
      type: 'MESSAGE_CREATED';
      chatMessageId: string;
    }
  | {
      type: 'MESSAGE_VERIFICATION_COMMAND_ISSUED';
    }
  | {
      type: 'MESSAGE_VERIFIED';
      chatMessageId: string;
      messageContent: string;
    };

export function chatReducer(state: ChatState, event: ChatEvent): ChatState {
  switch (event.type) {
    case 'START':
      return {
        ...state,
        phase: 'INIT',
      };

    case 'SEND_MESSAGE':
      return {
        ...state,
        phase: 'CREATING_MESSAGE',

        draftMessage: event.draftMessage,

        execution: {
          ...state.execution,
          messageCreationCommandIssued: false,
        },
      };

    case 'MESSAGE_CREATION_COMMAND_ISSUED':
      if (state.execution.messageCreationCommandIssued) {
        return state;
      }

      return {
        ...state,
        execution: {
          ...state.execution,
          messageCreationCommandIssued: true,
        },
      };

    case 'MESSAGE_CREATED':
      return {
        ...state,

        phase: 'MESSAGE_CREATED',

        activeMessageId: event.chatMessageId,

        messages: [
          ...state.messages,
          {
            id: event.chatMessageId,
            content: state.draftMessage ?? '',
            status: 'PENDING_VERIFICATION',
          },
        ],

        execution: {
          ...state.execution,
          messageCreationCommandIssued: true,
          messageVerificationCommandIssued: false,
        },
      };

    case 'MESSAGE_VERIFICATION_COMMAND_ISSUED':
      if (state.execution.messageVerificationCommandIssued) {
        return state;
      }

      return {
        ...state,

        phase: 'VERIFYING_MESSAGE',

        execution: {
          ...state.execution,
          messageVerificationCommandIssued: true,
        },
      };

    case 'MESSAGE_VERIFIED':
      return {
        ...state,

        phase: 'MESSAGE_VERIFIED',

        messages: state.messages.map((message) =>
          message.id === event.chatMessageId
            ? {
                ...message,
                content: event.messageContent,
                status: 'VERIFIED',
              }
            : message
        ),

        execution: {
          ...state.execution,
          messageVerificationCommandIssued: true,
        },
      };

    default:
      return state;
  }
}
