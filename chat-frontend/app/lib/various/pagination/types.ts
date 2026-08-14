import { z } from 'zod';

export const PaginationSettingsSchema = z.object({
  totalPages: z.number().int(),
  totalElements: z.number().optional(),
  size: z.number().int(),
  number: z.number().int(),
  sort: z
    .object({
      empty: z.boolean(),
      sorted: z.boolean(),
      unsorted: z.boolean(),
    })
    .optional(),
  first: z.boolean(),
  last: z.boolean(),
  numberOfElements: z.number().int().optional(),
  pageable: z
    .object({
      offset: z.number(),
      sort: z
        .object({
          empty: z.boolean(),
          sorted: z.boolean(),
          unsorted: z.boolean(),
        })
        .optional(),
      paged: z.boolean(),
      pageNumber: z.number().int(),
      pageSize: z.number().int(),
      unpaged: z.boolean(),
    })
    .optional(),
  empty: z.boolean(),
});
export type PaginationSettings = z.infer<typeof PaginationSettingsSchema>;

const PaginatedDataAnySchema = PaginationSettingsSchema.extend({
  content: z.any().array(),
});
export type PaginatedData = z.infer<typeof PaginatedDataAnySchema>;

/**
 * Spring Boot Pageable Schema
 * Standard pagination structure from Spring Boot backend
 */
export const PageableSchema = z.object({
  pageNumber: z.number().int().min(0),
  pageSize: z.number().int().min(1).max(100),
  sort: z.object({
    empty: z.boolean(),
    sorted: z.boolean(),
    unsorted: z.boolean(),
  }),
  offset: z.number().int().min(0),
  paged: z.boolean(),
  unpaged: z.boolean(),
});
export type Pageable = z.infer<typeof PageableSchema>;

/**
 * Pagination Request Parameters
 */
export const PaginationParamsSchema = z.object({
  page: z.number().int().min(0).default(0),
  size: z.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
});
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

/**
 * Sorting Parameters
 */
export const SortingParamsSchema = z.object({
  sort: z.string().optional(),
  direction: z.enum(['asc', 'desc']).optional(),
});
export type SortingParams = z.infer<typeof SortingParamsSchema>;

/**
 * Combined Table Parameters (pagination + sorting)
 */
export const TableParamsSchema = PaginationParamsSchema.merge(
  z.object({
    sort: z.string().optional(),
    direction: z.enum(['asc', 'desc']).optional(),
  })
);
export type TableParams = z.infer<typeof TableParamsSchema>;
