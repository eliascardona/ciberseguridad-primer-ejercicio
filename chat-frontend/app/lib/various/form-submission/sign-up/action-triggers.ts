import type { Navigation } from 'react-router';
import type { SubmitFunctionAbstraction } from '../utils';

export function generateSubmitOptionsForSignUp(
  submit: SubmitFunctionAbstraction['useSubmit'],
  navigation: Navigation
) {
  return {
    method: 'POST' as const,
    action: `/login` as const,
    contentType: 'application/json' as const,
    submit,
    navigation,
  };
}
