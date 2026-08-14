import { z } from 'zod';

export const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
  code: z.string().optional(),
  details: z.string().optional(),
  request_id: z.string().optional(),
  timestamp: z.string(),
});

export type GenericServerResponse<T> =
  | {
      success: boolean;
      message: string;
      data?: T | null;
    }
  | null
  | undefined;
