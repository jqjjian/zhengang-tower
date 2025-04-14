import { NextRequest } from 'next/server';
import { getCorsHeaders } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';

// 支持的资源类型及MIME类型映射
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.json': 'application/json',
  '.gltf': 'model/gltf+json',
  '.glb': 'model/gltf-binary',
  '.obj': 'application/object',
  '.mtl': 'text/plain',
  '.fbx': 'application/octet-stream'
};

/**
 * 处理静态资源请求
 */
export async function GET(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    console.log('请求路径:', request.url, '路径名:', pathname);
    
    // 从路径中获取文件路径
    // API路径格式: /api/resources/path/to/file.ext
    const filePath = pathname.replace(/^\/api\/resources/, '');
    console.log('文件路径:', filePath);
    
    if (!filePath || filePath === '/') {
      console.log('无效路径');
      return Response.json({ error: '无效的资源路径' }, { 
        status: 400, 
        headers: getCorsHeaders() 
      });
    }
    
    // 构建完整的文件路径
    const resourcesPath = process.env.STATIC_RESOURCES_PATH || './public/resources';
    const fullPath = path.join(process.cwd(), resourcesPath, filePath);
    console.log('完整文件路径:', fullPath);
    
    // 检查文件是否存在
    try {
      await fs.access(fullPath);
    } catch (error) {
      return Response.json({ error: '资源不存在' }, { 
        status: 404, 
        headers: getCorsHeaders() 
      });
    }
    
    // 读取文件内容
    const fileData = await fs.readFile(fullPath);
    
    // 获取文件扩展名
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // 返回文件内容
    return new Response(fileData, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileData.length.toString(),
        'Cache-Control': 'max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('获取资源错误:', error);
    return Response.json({ error: '服务器内部错误' }, { 
      status: 500, 
      headers: getCorsHeaders() 
    });
  }
}

/**
 * 处理预检请求
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders()
  });
} 