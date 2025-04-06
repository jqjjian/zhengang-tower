/**
 * API路径常量
 */
export const API_PATHS = {
  // 塔信息相关API
  TOWER: {
    BASE: '/api/tower',
    SECTIONS: '/api/tower/sections',
    DETAILS: '/api/tower/details',
  },
  
  // 文化知识相关API
  CULTURE: {
    BASE: '/api/culture',
    CATEGORIES: '/api/culture/categories',
    SEARCH: '/api/culture/search',
  },
  
  // 用户相关API
  USER: {
    BASE: '/api/user',
    LOGIN: '/api/user/login',
    REGISTER: '/api/user/register',
    PROFILE: '/api/user/profile',
  },
  
  // 许愿相关API
  WISH: {
    BASE: '/api/wish',
    SUBMIT: '/api/wish/submit',
    LIST: '/api/wish/list',
    MY_WISHES: '/api/wish/my-wishes',
  },
};

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  USER_TOKEN: 'zhengangtower_user_token',
  USER_INFO: 'zhengangtower_user_info',
  THEME: 'zhengangtower_theme',
  LANGUAGE: 'zhengangtower_language',
};

/**
 * 应用主题
 */
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

/**
 * 支持的语言
 */
export enum Language {
  ZH_CN = 'zh-CN',
  EN_US = 'en-US',
}

/**
 * 分页默认值
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_CURRENT_PAGE: 1,
};

/**
 * 错误消息
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络错误，请检查网络连接后重试',
  UNAUTHORIZED: '登录已过期，请重新登录',
  SERVER_ERROR: '服务器错误，请稍后重试',
  NOT_FOUND: '请求的资源不存在',
}; 