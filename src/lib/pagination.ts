import { z } from 'zod';

/**
 * Factory function to create a Zod schema for paginated query parameters.
 *
 * @template T - Zod object type representing the entity.
 * @template K - Keys of T to be allowed in the `sortBy` parameter.
 *
 * @param modelSchema - A Zod object schema representing the entity for which pagination is applied.
 * @returns A Zod object schema with `page`, `size`, `sortBy`, and `sortOrder` fields.
 *
 * Example usage:
 * ```ts
 * const UserSchema = z.object({ id: z.string(), name: z.string() });
 * const UserParamsSchema = createPaginationParamsSchema(UserSchema);
 * ```
 */
export const createPaginationParamsSchema = <
  T extends z.ZodRawShape,
  K extends keyof T & string,
>(
  modelSchema: z.ZodObject<T>
) => {
  const keys = Object.keys(modelSchema.shape) as [K, ...K[]];

  return z.object({
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).default(10),
    sortBy: z.enum(keys).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  });
};

/**
 * Factory function to create a Zod schema for a paginated result set.
 *
 * @template T - Zod type of a single item in the data array.
 *
 * @param itemSchema - Zod schema for the item type.
 * @returns A Zod object schema containing `data` array and `meta` information.
 *
 * Example usage:
 * ```ts
 * const UserResultSchema = createPaginatedResultSchema(UserSchema);
 * ```
 */
export const createPaginatedResultSchema = <T extends z.ZodTypeAny>(
  itemSchema: T
) =>
  z.object({
    data: z.array(itemSchema),
    meta: z.object({
      page: z.number().int().min(1),
      size: z.number().int().min(1),
      total: z.number().int().min(0),
      totalPages: z.number().int().min(1),
    }),
  });

/**
 * Generic type for paginated query parameters.
 *
 * Use this type when defining function or API request parameters for paginated endpoints.
 * Supports optional sorting by keys of the entity.
 *
 * @template T - Type of the entity being paginated.
 * @template K - Optional subset of keys of T allowed for `sortBy` (defaults to all keys of T).
 *
 * @example
 * ```ts
 * type UserParams = PaginationParams<User>;
 *
 * const params: UserParams = {
 *   page: 1,
 *   size: 20,
 *   sortBy: 'email',
 *   sortOrder: 'desc',
 * };
 * ```
 */
export type PaginationParams<T, K extends keyof T = keyof T> = {
  page: number;
  size: number;
  sortBy?: K | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
};

/**
 * Generic type for a paginated response/result set.
 *
 * Use this type to type the return value of functions or API endpoints that return paginated data.
 *
 * @template T - Type of a single item in the paginated data array.
 *
 * @example
 * ```ts
 * type UserResult = PaginatedResult<User>;
 *
 * const result: UserResult = {
 *   data: [ { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' } ],
 *   meta: {
 *     page: 1,
 *     size: 20,
 *     total: 100,
 *     totalPages: 5,
 *   },
 * };
 * ```
 */
export type PaginatedResult<T> = {
  data: T[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
};

/**
 * Calculates the offset for pagination based on page and size.
 *
 * @param page - Current page number (1-based)
 * @param size - Number of items per page
 * @returns The offset to use in queries
 */
export const getPaginationOffset = (page: number, size: number): number => {
  return (page - 1) * size;
};

/**
 * Builds a paginated result object.
 *
 * @template T - Type of the items
 * @param items - Array of items for the current page
 * @param total - Total number of items available
 * @param page - Current page number
 * @param size - Number of items per page
 * @returns PaginatedResult<T>
 */
export const buildPaginatedResult = <T>(
  items: T[],
  total: number,
  page: number,
  size: number
): PaginatedResult<T> => {
  const totalPages = Math.max(1, Math.ceil(total / size));
  return {
    data: items,
    meta: {
      page,
      size,
      total,
      totalPages,
    },
  };
};
