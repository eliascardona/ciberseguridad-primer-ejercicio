import { errorResponseSchema } from './types';

type RequestOptions = {
  method: string;
  headers: Record<string, string>;
  body?: string;
};

export type ApiError = {
  status: number;
  statusText: string;
  data: unknown;
};

type AuthTokenProvider = () => Promise<string | null>;

let API_BASE_URL = 'http://localhost:8082/api/';

if (typeof window !== 'undefined') {
  API_BASE_URL = import.meta.env.VITE_API_URL ?? API_BASE_URL;
} else {
  API_BASE_URL = process.env.VITE_API_URL ?? API_BASE_URL;
}

// Improved parameter handling types
export type QueryParams = Record<
  string,
  string | string[] | number | boolean | Date | null | undefined
>;

// Define ApiClient interface with explicit generic type parameters
export interface ApiClient {
  get<T>(
    endpoint: string,
    customHeaders?: Record<string, string>,
    parameters?: QueryParams
  ): Promise<T>;
  post<T>(
    endpoint: string,
    data: unknown,
    customHeaders?: Record<string, string>,
    parameters?: QueryParams
  ): Promise<T>;
  put<T>(
    endpoint: string,
    data?: unknown,
    customHeaders?: Record<string, string>,
    parameters?: QueryParams
  ): Promise<T>;
  patch<T>(
    endpoint: string,
    data: unknown,
    customHeaders?: Record<string, string>,
    parameters?: QueryParams
  ): Promise<T>;
  delete<T>(
    endpoint: string,
    data?: unknown,
    customHeaders?: Record<string, string>,
    parameters?: QueryParams
  ): Promise<T>;
}

/**
 * Enhanced parameter serialization that handles various data types
 */
const serializeParams = (
  params: QueryParams
): Record<string, string | string[]> => {
  const serialized: Record<string, string | string[]> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return; // Skip null/undefined values
    }

    if (Array.isArray(value)) {
      // Filter out null/undefined from arrays and convert to strings
      const filteredValues = value
        .filter((v) => v !== null && v !== undefined)
        .map((v) => String(v));

      if (filteredValues.length > 0) {
        serialized[key] = filteredValues;
      }
    } else if (value instanceof Date) {
      serialized[key] = value.toISOString();
    } else {
      serialized[key] = String(value);
    }
  });

  return serialized;
};

/**
 * Creates a fetch API client with authentication
 * @param authProvider - Optional function that returns a promise resolving to an auth token
 */
export const createApiClient = (
  authProvider?: AuthTokenProvider
): ApiClient => {
  /**
   * Helper function to build fetch options
   */
  const createRequestOptions = async (
    method: string,
    data?: unknown,
    customHeaders: Record<string, string> = {}
  ): Promise<RequestOptions> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (authProvider) {
      try {
        const token = await authProvider();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
    }

    const options: RequestOptions = {
      method,
      headers,
    };

    if (data && method !== 'GET' && method !== 'HEAD') {
      options.body = JSON.stringify(data);
    }

    return options;
  };

  /**
   * Processes response and handles errors
   */
  const handleResponse = async <T>(response: Response): Promise<T> => {
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
      let errorData;
      try {
        if (contentType?.includes('application/json')) {
          errorData = await response.json();

          // Try to validate with error schema
          try {
            errorResponseSchema.parse(errorData);
          } catch (e) {
            // If it doesn't match our error schema, just use as is
          }
        } else {
          errorData = await response.text();
        }
      } catch (e) {
        errorData = 'Failed to parse error response';
      }

      throw {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      };
    }

    if (contentType?.includes('application/json')) {
      return (await response.json()) as Promise<T>;
    }

    return (await response.text()) as unknown as T;
  };

  /**
   * Constructs the full URL with improved parameter handling
   */
  const getUrl = (endpoint: string, parameters?: QueryParams): string => {
    // Handle endpoints that already start with http(s)
    if (endpoint.startsWith('http')) {
      return endpoint;
    }

    // Normalize API base URL and endpoint to avoid double slashes
    const baseUrlNormalized = API_BASE_URL.replace(/\/+$/, '');

    // Handle endpoints with/without leading slash
    const formattedEndpoint = endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;
    const baseUrl = `${baseUrlNormalized}${formattedEndpoint}`;

    // Only append parameters if they exist
    if (parameters && Object.keys(parameters).length > 0) {
      const serializedParams = serializeParams(parameters);
      const searchParams = new URLSearchParams();

      Object.entries(serializedParams).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Handle multiple values for the same key
          value.forEach((v) => searchParams.append(key, v));
        } else {
          searchParams.append(key, value);
        }
      });

      const queryString = searchParams.toString();
      if (queryString) {
        const separator = endpoint.includes('?') ? '&' : '?';
        return `${baseUrl}${separator}${queryString}`;
      }
    }

    return baseUrl;
  };

  // Return API methods with improved parameter typing
  return {
    // GET request
    get: async <T>(
      endpoint: string,
      customHeaders = {},
      parameters = {}
    ): Promise<T> => {
      const url = getUrl(endpoint, parameters);
      const options = await createRequestOptions('GET', null, customHeaders);
      const response = await fetch(url, options);
      return handleResponse<T>(response);
    },

    // POST request
    post: async <T>(
      endpoint: string,
      data: unknown,
      customHeaders = {},
      parameters = {}
    ): Promise<T> => {
      const url = getUrl(endpoint, parameters);
      const options = await createRequestOptions('POST', data, customHeaders);
      const response = await fetch(url, options);
      return handleResponse<T>(response);
    },

    // PUT request
    put: async <T>(
      endpoint: string,
      data: unknown,
      customHeaders = {},
      parameters = {}
    ): Promise<T> => {
      const url = getUrl(endpoint, parameters);
      const options = await createRequestOptions('PUT', data, customHeaders);
      const response = await fetch(url, options);
      return handleResponse<T>(response);
    },

    // PATCH request
    patch: async <T>(
      endpoint: string,
      data: unknown,
      customHeaders = {},
      parameters = {}
    ): Promise<T> => {
      const url = getUrl(endpoint, parameters);
      const options = await createRequestOptions('PATCH', data, customHeaders);
      const response = await fetch(url, options);
      return handleResponse<T>(response);
    },

    // DELETE request
    delete: async <T>(
      endpoint: string,
      data: unknown = undefined,
      customHeaders = {},
      parameters = {}
    ): Promise<T> => {
      const url = getUrl(endpoint, parameters);
      const options = await createRequestOptions('DELETE', data, customHeaders);
      const response = await fetch(url, options);
      return handleResponse<T>(response);
    },
  };
};

/**
 * Create a client with a specific token (useful for server-side without request object)
 */
export const createTokenClient = (token: string | null): ApiClient => {
  return createApiClient(() => Promise.resolve(token));
};

// Default client with no authentication for simple requests
export const apiClient: ApiClient = createApiClient();
