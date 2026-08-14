import { useReducer } from 'react';
import { useActionData, useSubmit } from 'react-router';
import { useChatActionResolver, useChatEffects } from '~/lib/chat/hooks';
import { chatReducer } from '~/lib/chat/stateMachineReducer';
import type { action } from '~/routes/_index';
import { ChatViewHandler } from './stage-handler';

export function MainViewChat() {
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const [state, dispatch] = useReducer(chatReducer, {
    phase: 'INIT',
    messages: [],
    execution: {
      messageCreationCommandIssued: false,
      messageVerificationCommandIssued: false,
    },
  });

  /*
   * actionData → domain event
   */
  useChatActionResolver(actionData, dispatch);

  /*
   * state → commands
   */
  useChatEffects(state, submit, dispatch);

  return (
    <>
      <h1 className="pt-8 pl-8 text-3xl">Bienvenido al chat</h1>
      <div className="h-12"></div>
      <ChatViewHandler state={state} dispatch={dispatch} />
    </>
  );
}
