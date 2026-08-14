import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import type { GlobalContextData } from '../server/global-context';
import { createApiClient } from './client';

export const createAuthenticatedClient = (args: LoaderFunctionArgs) => {
  const getAuthToken = async () => {
    const context = args.context;
    const ctx = context as unknown as GlobalContextData;
    const accessToken = ctx.accessToken;

    if (!accessToken) {
      throw new Error('No access token found');
    }
    return accessToken;
  };
  return createApiClient(getAuthToken);
};

export const createAuthenticatedClientForAction = (
  args: ActionFunctionArgs
) => {
  const getAuthToken = async () => {
    const context = args.context;
    console.log('------------- THE CONTEXT IS', context);

    const ctx = context as unknown as GlobalContextData;
    const accessToken = ctx.accessToken;

    if (!accessToken) {
      throw new Error('No access token found');
    }
    return accessToken;
  };
  return createApiClient(getAuthToken);
};
