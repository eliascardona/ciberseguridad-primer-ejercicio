import { z } from 'zod';

export const ISODateTime = z.coerce
  .date()
  .transform((date) => date.toISOString());
export const ISODateTimeOptionalNullable = z.coerce
  .date()
  .transform((date) => date.toISOString())
  .optional()
  .nullable();
