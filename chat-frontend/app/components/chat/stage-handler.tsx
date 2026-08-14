import type { CheckoutState } from '~/lib/shopping/reducers/checkoutReducer';

export function CheckoutViewHandler({ state }: { state: CheckoutState }) {
  const renderComp = () => {
    switch (state.phase) {
      case 'CREATING_CHECKOUT_SESSION':
        return <></>;

      case 'ORDER_READY': {
        return <></>;
      }

      default:
        return <>Loading…</>;
    }
  };
  return (
    <div className="grid w-full place-items-center">
      <div className="w-1/2 rounded-md border border-gray-200 px-4 py-6">
        {renderComp()}
      </div>
    </div>
  );
}
