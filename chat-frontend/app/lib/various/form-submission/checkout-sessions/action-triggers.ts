import {
  useSubmitFromReactRouter,
  type BaseUseFormSubmitOptions,
  type SubmitFunctionAbstraction,
} from '../utils';
import { formatDataIntoRequestMessageSaving } from './payload-formatters';

function generateSubmitOptionsForMessaging(
  submit: SubmitFunctionAbstraction['useSubmit']
) {
  const OPTIONS: BaseUseFormSubmitOptions = {
    method: 'POST' as const,
    action: `/` as const,
    contentType: 'application/json' as const,
    submit,
  };

  return OPTIONS;
}

export function triggerCheckoutSessionCreation(
  data: { message: string },
  submit: SubmitFunctionAbstraction['useSubmit']
) {
  const options = generateSubmitOptionsForMessaging(submit);

  const { submitForm } = useSubmitFromReactRouter(options);
  const formattedData = formatDataIntoRequestMessageSaving(data);

  submitForm(formattedData);
}
