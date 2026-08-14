import {
  ShoppingActionEnum,
  type SignupRequestBody,
} from '~/lib/shopping/types';

export function formatDataIntoSignupRequest(data: any): SignupRequestBody {
  const SignupRequestBody: SignupRequestBody = {
    intent: ShoppingActionEnum.enum.SIGNUP,
    body: {
      email: data.email,
      password: data.password,
      username: data.username,
    },
  };
  return SignupRequestBody;
}
