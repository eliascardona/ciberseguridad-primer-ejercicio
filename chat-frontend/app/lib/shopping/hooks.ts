import { useEffect } from 'react';
import type { SubmitFunction } from 'react-router';
import { STRIPE_PRICE_ID } from '~/lib/TESTING_MOCKS';
import { TENANT_ID } from '../TESTING_MOCKS';
import { triggerCheckoutSessionCreation } from '../various/form-submission/checkout-sessions/action-triggers';
import { triggerOrderCreation } from '../various/form-submission/orders/action-triggers';
import type { CheckoutEvent, CheckoutState } from './reducers/checkoutReducer';
import { ShoppingActionEnum } from './types';

export function useCheckoutActionResolver(
  actionData: any,
  dispatch: React.Dispatch<CheckoutEvent>
) {
  useEffect(() => {
    if (!actionData?.success) return;

    switch (actionData.message) {
      case ShoppingActionEnum.enum.CREATE_CHECKOUT_SESSION:
        dispatch({
          type: 'CHECKOUT_SESSION_CREATED',
          sessionId: actionData.data?.sessionId || 'sessionId',
        });
        break;

      case ShoppingActionEnum.enum.CREATE_ORDER: {
        dispatch({
          type: 'ORDER_CREATED',
          orderId: actionData.data?.orderId || 'orderId',
          internalPaymentIntentId:
            actionData.data?.internalPaymentIntentId ||
            'internalPaymentIntentId',
          externalPaymentIntentId:
            actionData.data?.externalPaymentIntentId ||
            'externalPaymentIntentId',
          stripeClientSecret:
            actionData.data?.stripeClientSecret || 'stripeClientSecret',
        });
        break;
      }
    }
  }, [actionData, dispatch]);
}

export function useCheckoutEffects(
  state: CheckoutState,
  submit: SubmitFunction,
  ctx: { userId: string; productId: string },
  dispatch: React.Dispatch<CheckoutEvent>
) {
  useEffect(() => {
    if (
      state.phase === 'CREATING_CHECKOUT_SESSION' &&
      !state.execution.checkoutSessionCommandIssued
    ) {
      dispatch({ type: 'CHECKOUT_SESSION_COMMAND_ISSUED' });
      const contents = {
        userId: ctx.userId,
        tenantId: TENANT_ID,
        currency: 'MXN',
        stripePriceId: STRIPE_PRICE_ID,
      };
      triggerCheckoutSessionCreation(ctx.productId, contents, submit);
    }

    if (
      state.phase === 'CHECKOUT_SESSION_READY' &&
      !state.execution.orderCommandIssued &&
      state.checkoutSessionId
    ) {
      dispatch({ type: 'ORDER_COMMAND_ISSUED' });
      const command = {
        userId: ctx.userId,
        tenantId: TENANT_ID,
        checkoutSessionId: state.checkoutSessionId!,
      };
      triggerOrderCreation(ctx.productId, command, submit);
    }
  }, [state, submit, ctx, dispatch]);
}
