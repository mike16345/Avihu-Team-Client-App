export interface PaginationParams {
  limit: number;
  page: number;
  query?: Record<string, any>;
}

export interface PaginationResult<T> {
  results: T[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
