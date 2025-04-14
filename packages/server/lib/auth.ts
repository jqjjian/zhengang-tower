import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

// 权限验证中间件
export async function verifyAuth(request: NextRequest) {
  // 获取Authorization头
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return {
      authenticated: false,
      error: '未提供身份验证令牌',
      status: 401
    };
  }

  try {
    // 验证JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as DecodedToken;

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return {
        authenticated: false,
        error: '用户不存在',
        status: 401
      };
    }

    return {
      authenticated: true,
      user,
      userId: user.id
    };
  } catch (error) {
    return {
      authenticated: false,
      error: '无效的身份验证令牌',
      status: 401
    };
  }
}

// 生成标准响应头
export function getCorsHeaders() {
  // 获取允许的跨域域名
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['*'];

  // 对于通配符域名，直接返回*
  const origin = allowedOrigins.includes('*')
    ? '*'
    : allowedOrigins.join(', ');

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };
} 