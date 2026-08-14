import {
  ShoppingActionEnum,
  type CreateOrderFromCheckoutSessionCommand,
  type OrderCreationRequestBody,
} from '~/lib/shopping/types';

export function formatDataIntoOrderCreationRequestBody(
  data: CreateOrderFromCheckoutSessionCommand
): OrderCreationRequestBody {
  const orderCreationRequestBody: OrderCreationRequestBody = {
    intent: ShoppingActionEnum.enum.CREATE_ORDER,
    body: {
      userId: data.userId,
      tenantId: data.tenantId,
      checkoutSessionId: data.checkoutSessionId,
    },
  };

  return orderCreationRequestBody;
}
