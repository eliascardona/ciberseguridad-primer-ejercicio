import type { Navigation } from 'react-router';
import type { CreateOrderFromCheckoutSessionCommand } from '~/lib/shopping/types';
import {
  useSubmitFromReactRouter,
  type BaseUseFormSubmitOptions,
  type SubmitFunctionAbstraction,
} from '../utils';
import { formatDataIntoOrderCreationRequestBody } from './payload-formatters';

function generateSubmitOptionsForOrdering(
  productId: string,
  submit: SubmitFunctionAbstraction['useSubmit']
) {
  const BASE_SUBMIT_OPTIONS_FOR_ORDERING: BaseUseFormSubmitOptions = {
    method: 'POST' as const,
    action: `/course/${productId}/checkout` as const,
    contentType: 'application/json' as const,
    submit,
  };

  return BASE_SUBMIT_OPTIONS_FOR_ORDERING;
}

export function submitOptionsForOrdering_withNavigation(
  productId: string,
  submit: SubmitFunctionAbstraction['useSubmit'],
  navigation: Navigation
) {
  return {
    ...generateSubmitOptionsForOrdering(productId, submit),
    navigation,
  };
}

function submitOptionsForOrdering_withoutNavigation(
  productId: string,
  submit: SubmitFunctionAbstraction['useSubmit']
) {
  return { ...generateSubmitOptionsForOrdering(productId, submit) };
}

export function triggerOrderCreation(
  productId: string,
  command: CreateOrderFromCheckoutSessionCommand,
  submit: SubmitFunctionAbstraction['useSubmit']
) {
  const options = submitOptionsForOrdering_withoutNavigation(productId, submit);

  const { submitForm } = useSubmitFromReactRouter(options);
  const formattedData = formatDataIntoOrderCreationRequestBody(command);

  submitForm(formattedData);
}
