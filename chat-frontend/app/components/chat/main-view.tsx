import { useEffect, useReducer } from 'react';
import { useActionData, useSubmit } from 'react-router';
import {
  useCheckoutActionResolver,
  useCheckoutEffects,
} from '~/lib/shopping/hooks';
import { checkoutReducer } from '~/lib/shopping/reducers/checkoutReducer';
import type { action } from '~/routes/course.$productId.checkout';
import { CheckoutViewHandler } from './stage-handler';

export function MainViewChat() {
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  /* Authoritative state machine */
  const [state, dispatch] = useReducer(checkoutReducer, {
    phase: 'INIT',
    execution: {
      checkoutSessionCommandIssued: false,
      orderCommandIssued: false,
    },
  });

  /* Action resolver */
  useCheckoutActionResolver(actionData, dispatch);

  /* Effect executor (only when state is authorized and commands are ready) */
  useCheckoutEffects(
    state,
    submit,
    {
      userId: '',
      productId,
    },
    dispatch
  );

  /* Bootstrap initial side effect */
  useEffect(() => {
    if (state.phase === 'INIT') {
      dispatch({
        type: 'START',
      });
    }
  }, [state.phase]);

  return <CheckoutViewHandler state={state} />;
}
