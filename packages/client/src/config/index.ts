// 环境配置
const env = process.env.NODE_ENV || 'development';

// API基础URL配置
export const API_BASE_URL = {
    // 开发环境配置 - 使用本机IP地址，确保手机和电脑在同一网络
    development: 'http://192.168.31.149:3000', // 替换为你电脑的实际IP地址和端口
    production: 'http://192.168.31.149:3000'    // 生产环境 - 替换为实际域名
}[env];

// 静态资源URL配置
export const RESOURCE_URL = `${API_BASE_URL}/api/resources`;

// 其他配置
export default {
    API_BASE_URL,
    RESOURCE_URL
}; 