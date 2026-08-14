import { useEffect } from 'react';
import type { SubmitFunction } from 'react-router';
import type { ServerActionResult } from '../shared/types';
import {
  triggerMessageVerification,
  triggerSaveMessage,
} from '../various/form-submission/chat/action-triggers';
import {
  MessagingActionResponseEnum,
  type MessagingActionResponse,
} from './response-types';
import type { ChatEvent, ChatState } from './stateMachineReducer';

export function useChatActionResolver(
  actionData: ServerActionResult<MessagingActionResponse> | undefined,
  dispatch: React.Dispatch<ChatEvent>
) {
  useEffect(() => {
    if (!actionData || !actionData.success) {
      return;
    }

    switch (actionData.performedAction) {
      case MessagingActionResponseEnum.enum.MESSAGE_SAVED:
        dispatch({
          type: 'MESSAGE_CREATED',
          chatMessageId: actionData.data.chatMessageId,
        });
        break;

      case MessagingActionResponseEnum.enum.MESSAGE_VERIFIED:
        dispatch({
          type: 'MESSAGE_VERIFIED',
          chatMessageId: actionData.data.chatMessageId,
          messageContent: actionData.data.messageContent,
        });
        break;
    }
  }, [actionData, dispatch]);
}

export function useChatEffects(
  state: ChatState,
  submit: SubmitFunction,
  dispatch: React.Dispatch<ChatEvent>
) {
  useEffect(() => {
    /*
     * STEP 1
     *
     * The state machine authorizes
     * creation of the message.
     */
    if (
      state.phase === 'CREATING_MESSAGE' &&
      !state.execution.messageCreationCommandIssued &&
      state.draftMessage
    ) {
      dispatch({
        type: 'MESSAGE_CREATION_COMMAND_ISSUED',
      });

      triggerSaveMessage({ message: state.draftMessage }, submit);
    }

    /*
     * STEP 2
     *
     * The message was created and the backend
     * returned its ID.
     *
     * Now the machine authorizes verification.
     */
    if (
      state.phase === 'MESSAGE_CREATED' &&
      state.activeMessageId &&
      !state.execution.messageVerificationCommandIssued
    ) {
      dispatch({
        type: 'MESSAGE_VERIFICATION_COMMAND_ISSUED',
      });

      triggerMessageVerification(
        { chatMessageId: state.activeMessageId },
        submit
      );
    }
  }, [state, submit, dispatch]);
}
