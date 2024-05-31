export class PaginationResult<T> {
  data: T;

  skip: number;

  limit: number;

  total: number;

  pageCount: number;
}
