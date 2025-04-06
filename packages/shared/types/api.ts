/**
 * API响应基础接口
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 分页请求参数接口
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * 分页响应数据接口
 */
export interface PaginatedResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  items: T[];
}

/**
 * 搜索参数接口
 */
export interface SearchParams {
  keyword?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * 用户登录请求接口
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 用户登录响应接口
 */
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
    role: string;
  };
}

/**
 * 用户注册请求接口
 */
export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phone?: string;
  verifyCode?: string;
}

/**
 * 许愿提交请求接口
 */
export interface WishSubmitRequest {
  content: string;
  type: string;
  anonymous?: boolean;
}

/**
 * 通用错误响应接口
 */
export interface ErrorResponse {
  code: number;
  message: string;
  details?: string[];
} 