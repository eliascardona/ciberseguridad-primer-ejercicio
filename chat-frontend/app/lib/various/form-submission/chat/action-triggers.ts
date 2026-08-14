import {
  useSubmitFromReactRouter,
  type BaseUseFormSubmitOptions,
  type SubmitFunctionAbstraction,
} from '../utils';
import {
  formatDataIntoSaveMessageRequest,
  formatDataIntoVerifyMessageRequest,
} from './payload-formatters';

function generateSubmitOptionsForMessaging(
  submit: SubmitFunctionAbstraction['useSubmit']
) {
  const OPTIONS: BaseUseFormSubmitOptions = {
    method: 'POST' as const,
    action: `/chat` as const,
    contentType: 'application/json' as const,
    submit,
  };

  return OPTIONS;
}

export function triggerSaveMessage(
  data: { message: string },
  submit: SubmitFunctionAbstraction['useSubmit']
) {
  const options = generateSubmitOptionsForMessaging(submit);

  const { submitForm } = useSubmitFromReactRouter(options);
  const formattedData = formatDataIntoSaveMessageRequest(data);

  submitForm(formattedData);
}

export function triggerMessageVerification(
  data: { chatMessageId: string },
  submit: SubmitFunctionAbstraction['useSubmit']
) {
  const options = generateSubmitOptionsForMessaging(submit);

  const { submitForm } = useSubmitFromReactRouter(options);
  const formattedData = formatDataIntoVerifyMessageRequest(data);

  submitForm(formattedData);
}
