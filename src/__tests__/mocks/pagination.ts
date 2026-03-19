import { PaginatedResult, PaginationParams } from '@/lib/pagination';

export function createPaginationMock<T>(
  overrides?: Partial<PaginationParams<T>>
): PaginationParams<T> {
  return {
    page: 1,
    size: 10,
    sortOrder: 'asc',
    ...overrides,
  };
}

export function createPaginatedResultMock<T>(
  data: T[],
  overrides?: Partial<PaginatedResult<T>['meta']>
): PaginatedResult<T> {
  const page = overrides?.page ?? 1;
  const size = overrides?.size ?? data.length ?? 10;
  const total = overrides?.total ?? data.length;
  const totalPages =
    overrides?.totalPages ?? Math.max(1, Math.ceil(total / size));

  return {
    data,
    meta: {
      page,
      size,
      total,
      totalPages,
      ...overrides,
    },
  };
}
