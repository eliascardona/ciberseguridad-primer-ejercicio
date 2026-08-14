import type { MiddlewareFunction, Session } from 'react-router';
import { createContext } from 'react-router';
import type { UserDetails } from '../auth/types';
import { getAuthSessionFromContext } from './auth';

/**
 * Global request-scoped data for React Router
 * (browser-safe, deterministic)
 */
export type GlobalContextData = {
  authSession: Session;
  user?: UserDetails;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
};

/**
 * React Router context key
 */
export const globalContext = createContext<GlobalContextData>();

/**
 * Middleware that populates the global context
 */
export const globalContextMiddleware: MiddlewareFunction<Response> = async (
  { context },
  next
) => {
  const authSession = getAuthSessionFromContext(context);

  context.set(globalContext, {
    authSession,
    user: authSession.get('user'),
    accessToken: authSession.get('accessToken'),
    refreshToken: authSession.get('refreshToken'),
    expiresAt: authSession.get('expiresAt'),
  });

  return next();
};
