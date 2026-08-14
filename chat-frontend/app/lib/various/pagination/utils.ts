import type { PaginatedData } from './types';

export function generateBlankPage() {
  return {
    totalPages: 1,
    totalElements: 0,
    size: 20,
    number: 0,
    first: true,
    last: false,
    numberOfElements: 0,
    empty: false,
    content: [],
  } as PaginatedData;
}
