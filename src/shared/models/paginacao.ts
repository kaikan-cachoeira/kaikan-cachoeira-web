export interface Paginado<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ParametrosPaginacao {
  page?: number;
  pageSize?: number;
  search?: string;
}
