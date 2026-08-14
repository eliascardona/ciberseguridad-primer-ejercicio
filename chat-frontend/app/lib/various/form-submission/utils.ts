import type {
  FormEncType,
  HTMLFormMethod,
  Navigation,
  SubmitOptions,
  SubmitTarget,
} from 'react-router';

export type SubmitFunctionAbstraction = {
  useSubmit: (target: SubmitTarget, options?: SubmitOptions) => Promise<void>;
};

export type BaseUseFormSubmitOptions = {
  action?: string;
  method?: HTMLFormMethod;
  contentType?: string;
  onError?: (error: unknown) => void;
  submit: SubmitFunctionAbstraction['useSubmit'];
};

type WithNavigation = BaseUseFormSubmitOptions & {
  navigation: Navigation;
};

type WithoutNavigation = BaseUseFormSubmitOptions & {
  navigation?: undefined;
};

type SubmitResponseWithNavigation = {
  submitForm: (formValues: any) => Promise<void>;
  isSubmitting: boolean;
};

type SubmitResponseWithoutNavigation = {
  submitForm: (formValues: any) => Promise<void>;
};

export function useSubmitFromReactRouter(
  options: WithNavigation
): SubmitResponseWithNavigation;

export function useSubmitFromReactRouter(
  options: WithoutNavigation
): SubmitResponseWithoutNavigation;

/** @TODO DOCUMENT THE REMAINING PAREMETERS OF useSubmitFromReactRouter */

/**
 * This function is intended to trigger a **POST/PUT/PATCH/DELETE** HTTP
 * request via a React Router's _action_ and React Router's _useSubmit_
 * hook.
 *
 * An instance of _useSubmit_ hook must be passed as an argument since
 * we don't consider a good practice to one, we would end up calling a hook
 * outside a client runtine, and two, apply the singleton pattern here.
 *
 * @param {Object} parameters Destructured JS Object that contains all parameters.
 * @param {string} parameters.action The URL segment (also know as path segment) which points to the React Router's _action_
 * @param {string} parameters.method A required string value that indicates the HTTP Method that is intended to use to in the request.
 *                                   The TS type as such, is an abstraction of standard HTTP methods (like GET and POST) elaborated by React Router.
 *                                   The default value applied to this parameter is 'post' in lowecase.
 * @param {string} parameters.contentType Standard MIME Type (accepted data types in HTTP network transmitions) will be accpeted here.
 *                                        e.g. **_'application/json', application/x-www-form-urlencoded, 'multipart/form-data'_**. The default value is 'application/json'.
 */
export function useSubmitFromReactRouter({
  action,
  method = 'post',
  contentType = 'application/json',
  onError,
  submit,
  navigation,
}: WithNavigation | WithoutNavigation) {
  /**
   * It's mandatory to wrap this callback with the
   * _handleSubmit_ function of React Hook Form as it
   * provides all values for the fields that were marked as required
   * at the moment of the submission.
   * Also is highly recommended to use this function alongside a server action handler, that's to say:
   * It's needed to write a server or client action to receive the request
   * It won't make sense to write an action to handle the request if the response of the action
   * is not properly handled in the frontend component.
   *
   * Often, the component responsible for the handling of the action response is the _Owner Component_
   * of the form that triggered this function.
   *
   * @param {object} formValues form values provided by the _handleSubmit_ function of RHF library
   *
   */
  const submitForm = async (formValues: any) => {
    const submitMethod = method as HTMLFormMethod;
    const submitAction = action;
    const submitContentType = contentType as FormEncType;

    try {
      await submit(formValues, {
        method: submitMethod,
        action: submitAction,
        encType: submitContentType,
      });
    } catch (error: any) {
      onError?.(error.message);
      throw new Error(error.message);
    }
  };

  if (!navigation) return { submitForm };

  return {
    isSubmitting: navigation.state === 'submitting',
    submitForm,
  };
}
