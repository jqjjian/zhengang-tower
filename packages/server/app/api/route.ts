import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return Response.json({
    name: '振钢大厦 API 服务',
    version: '1.0.0',
    status: 'running'
  });
}

// OPTIONS 方法用于响应 CORS 预检请求
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
  });
} 