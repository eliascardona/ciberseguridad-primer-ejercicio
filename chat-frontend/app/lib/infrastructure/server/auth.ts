import {
  createContext,
  createCookieSessionStorage,
  redirect,
  type MiddlewareFunction,
  type Session,
  type SessionData,
  type SessionStorage,
} from 'react-router';
import type {
  AuthResponse,
  CreateSessionMiddlewareReturnType,
  SessionStorageGetter,
  ShouldCommitFunction,
  UserDetails,
} from '~/lib/infrastructure/auth/types';
import { apiClient } from '../api/client';

function defaultShouldCommit() {
  return true;
}

export function createSessionMiddleware<Data = SessionData, FlashData = Data>(
  sessionStorage:
    | SessionStorage<Data, FlashData>
    | SessionStorageGetter<Data, FlashData>,
  shouldCommit: ShouldCommitFunction<Data> = defaultShouldCommit
): CreateSessionMiddlewareReturnType<Data, FlashData> {
  const sessionContext = createContext<Session<Data, FlashData>>();

  return [
    async function middleware({ request, context }, next) {
      const storage =
        typeof sessionStorage === 'function'
          ? sessionStorage(request, context)
          : sessionStorage;

      const session = await storage.getSession(request.headers.get('Cookie'));

      const initialData = structuredClone(session.data);

      context.set(sessionContext, session);

      const response = await next();

      if (shouldCommit(initialData, structuredClone(session.data))) {
        response.headers.append(
          'Set-Cookie',
          await storage.commitSession(session)
        );
      }

      return response;
    },

    function getSession(context) {
      return context.get(sessionContext);
    },
  ];
}

const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__auth_session',
    httpOnly: true,
    secure: import.meta.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secrets: [import.meta.env.SESSION_SECRET || 'fallback-secret-for-dev'],
  },
});

const [authSessionMiddleware, getAuthSessionFromContext] =
  createSessionMiddleware(authSessionStorage);

export { authSessionMiddleware, getAuthSessionFromContext };

export const setAuthSession = (
  authSession: Session,
  response: AuthResponse
) => {
  authSession.set('user', response.user);
  authSession.set('accessToken', response.accessToken);
  authSession.set('expiresAt', Date.now() + response.expiresIn);
};

export const clearAuthSession = (authSession: Session) => {
  authSession.unset('user');
  authSession.unset('accessToken');
  authSession.unset('expiresAt');
};

const isTokenExpired = (expiresAt: number): boolean => {
  const buffer = 5 * 60 * 1000; // 5 minutes in milliseconds
  return Date.now() >= expiresAt - buffer;
};

const refreshAccessToken = async (
  refreshToken: string
): Promise<AuthResponse | null> => {
  try {
    return await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

export const validateTokenMiddleware: MiddlewareFunction<Response> = async (
  { context },
  next
) => {
  const authSession = getAuthSessionFromContext(context);
  const sessionData = authSession.data;

  if (!sessionData.user || !sessionData.accessToken) {
    return next();
  }

  const expiresAt = sessionData.expiresAt as number;
  const refreshToken = sessionData.refreshToken as string;

  if (expiresAt && isTokenExpired(expiresAt)) {
    console.log('Token expired, attempting refresh...');

    if (refreshToken) {
      const authResponse = await refreshAccessToken(refreshToken);

      if (authResponse) {
        const newExpiresAt = Date.now() + authResponse.expiresIn;

        authSession.set('accessToken', authResponse.accessToken);
        authSession.set('user', authResponse.user);
        authSession.set('expiresAt', newExpiresAt);
      } else {
        clearAuthSession(authSession);
      }
    } else {
      clearAuthSession(authSession);
    }
  }

  return next();
};

export const requireUser: MiddlewareFunction = ({ context }, next) => {
  const authSession = getAuthSessionFromContext(context);
  const user = authSession.get('user') as UserDetails;
  const accessToken = authSession.get('accessToken');
  const expiresAt = authSession.get('expiresAt') as number;

  if (!user || !accessToken || (expiresAt && isTokenExpired(expiresAt))) {
    throw redirect('/login');
  }

  return next();
};
