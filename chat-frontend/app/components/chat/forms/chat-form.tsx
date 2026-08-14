import { useFormContext } from 'react-hook-form';
import { useNavigation, useSubmit } from 'react-router';
import { FormTrigger } from '~/components/forms/form-submission-trigger';
import { getProductIdFromPathname } from '~/lib/utils/utils';
import {
  FieldTypeEnum,
  type FieldConfig,
} from '~/lib/various/form-retrieving/types';
import { submitOptionsForOrdering_withNavigation } from '~/lib/various/form-submission/checkout-sessions/action-triggers';
import { formatDataIntoSignupRequest } from '~/lib/various/form-submission/sign-up/payload-formatters';
import { useSubmitFromReactRouter } from '~/lib/various/form-submission/utils';

export function ChatForm() {
  const submit = useSubmit();
  const navigation = useNavigation();
  const productId = getProductIdFromPathname();

  const options = submitOptionsForOrdering_withNavigation(
    productId,
    submit,
    navigation
  );
  const { submitForm, isSubmitting } = useSubmitFromReactRouter(options);
  const { handleSubmit } = useFormContext();

  const submitHandler = (data: any) => {
    const formattedData = formatDataIntoSignupRequest(data);

    submitForm(formattedData);
  };

  const formFields: FieldConfig[] = [
    {
      name: 'username',
      label: 'Enter a username',
      type: FieldTypeEnum.enum.text,
      order: 1,
    },
    {
      name: 'email',
      label: 'Ingress your email',
      type: FieldTypeEnum.enum.text,
      order: 2,
    },
    {
      name: 'password',
      label: 'Type a password',
      type: FieldTypeEnum.enum.pass,
      order: 3,
    },
  ];

  return (
    <FormTrigger
      fieldArray={formFields}
      onSubmit={handleSubmit(submitHandler)}
      submitLabel={'Crear cuenta'}
      disabled={isSubmitting}
    />
  );
}
