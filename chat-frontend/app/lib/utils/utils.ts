import { useLocation, useNavigation, useSubmit } from 'react-router';

type FormValues = Record<string, any>;
type TriggerOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  action: string;
  encType: 'application/json';
};

export function useServerActionTrigger() {
  const submit = useSubmit();
  const navigation = useNavigation();

  const triggerAction = (formValues: FormValues, options: TriggerOptions) => {
    submit(formValues, options);
  };
  const isSubmittingForm = navigation.state === 'submitting';

  return {
    triggerAction,
    isSubmittingForm,
  };
}

export const getProductIdFromPathname = () => {
  const location = useLocation();
  const pathnameArray = location.pathname;
  return pathnameArray.split('/')[2];
};
