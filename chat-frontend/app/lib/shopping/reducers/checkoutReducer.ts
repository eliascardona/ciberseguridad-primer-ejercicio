export type CheckoutPhase =
  | 'INIT'
  | 'CREATING_CHECKOUT_SESSION'
  | 'CHECKOUT_SESSION_READY'
  | 'CREATING_ORDER'
  | 'ORDER_READY';

export type ExecutionFlags = {
  chatMessageIdIssued: boolean;
};

export type CheckoutState = {
  phase: CheckoutPhase;
  chatMessageId?: string;
  executionFlags: ExecutionFlags;
};

export type CheckoutEvent =
  | { type: 'START'; stripePriceId: string }
  | { type: 'CHECKOUT_SESSION_COMMAND_ISSUED' }
  | { type: 'CHECKOUT_SESSION_CREATED'; sessionId: string }
  | { type: 'ORDER_COMMAND_ISSUED' }
  | {
      type: 'ORDER_CREATED';
      orderId: string;
      internalPaymentIntentId: string;
      externalPaymentIntentId: string;
      stripeClientSecret: string;
    };

export function checkoutReducer(
  state: CheckoutState,
  event: CheckoutEvent
): CheckoutState {
  switch (event.type) {
    case 'START':
      return {
        phase: 'CREATING_CHECKOUT_SESSION',
        executionFlags: {
          chatMessageIdIssued: false,
        },
      };

    case 'CHECKOUT_SESSION_COMMAND_ISSUED':
      if (state.executionFlags.checkoutSessionCommandIssued) return state;
      return {
        ...state,
        executionFlags: {
          ...state.executionFlags,
        },
      };
    case 'ORDER_CREATED':
      return {
        ...state,
        phase: 'ORDER_READY',
        orderId: event.orderId,
        internalPaymentIntentId: event.internalPaymentIntentId,
        externalPaymentIntentId: event.externalPaymentIntentId,
        stripeClientSecret: event.stripeClientSecret,
      };

    default:
      return state;
  }
}
