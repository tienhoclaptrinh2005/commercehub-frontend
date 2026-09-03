export interface PageResponse<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  data: T[];
}

/** Phân trang không chạy truy vấn COUNT(*), chỉ cho biết còn trang trước/sau. */
export interface SliceResponse<T> {
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  pageNumbers: number[];
  data: T[];
}

/** Dạng Page mặc định do Spring Data trả trực tiếp. */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/** Dạng Slice của Spring Data: không đếm tổng bản ghi/tổng số trang. */
export interface SpringSlice<T> {
  content: T[];
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
