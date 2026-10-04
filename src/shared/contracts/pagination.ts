export interface PageRequest {
  readonly page: number;
  readonly limit: number;
}

export interface PageResult<TItem> {
  readonly items: readonly TItem[];
  readonly total: number;
}

export interface PaginatedResponse<TItem> {
  readonly items: readonly TItem[];
  readonly total: number;
  readonly totalPages: number;
  readonly page: number;
  readonly limit: number;
}

export function toPaginatedResponse<TItem>(
  result: PageResult<TItem>,
  request: PageRequest,
): PaginatedResponse<TItem> {
  return {
    items: result.items,
    total: result.total,
    totalPages: Math.ceil(result.total / request.limit),
    page: request.page,
    limit: request.limit,
  };
}

export function skipOf(request: PageRequest): number {
  return (request.page - 1) * request.limit;
}
