import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { getCorsHeaders } from '@/lib/auth';

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

// 长缓存的资源类型
const LONG_CACHE_EXTS = ['.glb', '.gltf', '.obj', '.fbx', '.jpg', '.png', '.webp'];

/**
 * 处理静态资源请求
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        // 确保params.path是可用的
        const pathArray = Array.isArray(params.path) ? params.path : [];
        console.log('路径参数:', pathArray);

        // 从路径参数构建文件路径
        const filePath = pathArray.join('/');
        console.log('文件路径:', filePath);

        if (!filePath) {
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
            console.error('文件不存在:', fullPath);
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

        // 根据文件类型设置缓存策略
        const cacheControl = LONG_CACHE_EXTS.includes(ext)
            ? 'public, max-age=31536000, immutable' // 1年缓存，适合3D模型等不经常变化的资源
            : 'public, max-age=3600'; // 1小时缓存，适合其他资源

        // 创建响应头
        const headers: Record<string, string> = {
            'Content-Type': contentType,
            'Content-Length': fileData.length.toString(),
            'Cache-Control': cacheControl,
            // 设置全面的CORS头
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Accept',
            'Cross-Origin-Resource-Policy': 'cross-origin',
            'Access-Control-Max-Age': '86400' // 1天，减少预检请求频率
        };

        // 针对3D模型文件添加额外头部
        if (ext === '.glb' || ext === '.gltf') {
            console.log('处理3D模型文件:', ext);
            // 不做额外压缩，保持原始二进制数据
            headers['Content-Encoding'] = 'identity';

            // 对glb文件进行特殊标记，便于排查问题
            if (ext === '.glb') {
                headers['X-Content-Type-Options'] = 'nosniff';
            }
        }

        // 返回文件内容
        return new Response(fileData, { headers });
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
    const corsHeaders: Record<string, string> = {
        ...getCorsHeaders(),
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
        'Access-Control-Max-Age': '86400' // 1天
    };

    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
} 