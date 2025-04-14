import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCorsHeaders } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * 获取3D模型列表或单个模型
 */
export async function GET(request: NextRequest) {
  try {
    const headers = getCorsHeaders();
    const { searchParams } = new URL(request.url);
    const scene = searchParams.get('scene');
    const id = searchParams.get('id');

    // 获取单个模型
    if (id) {
      const model = await prisma.model3D.findUnique({
        where: { id }
      });

      if (!model) {
        return Response.json({ error: '模型不存在' }, { status: 404, headers });
      }

      return Response.json(model, { headers });
    }

    // 按场景获取模型列表
    if (scene) {
      const models = await prisma.model3D.findMany({
        where: { scene }
      });

      return Response.json(models, { headers });
    }

    // 获取所有模型
    const models = await prisma.model3D.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return Response.json(models, { headers });
  } catch (error) {
    console.error('获取模型错误:', error);
    return Response.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

/**
 * 添加新模型（需要管理员权限）
 */
export async function POST(request: NextRequest) {
  try {
    // 这里应该添加管理员权限验证
    
    const headers = getCorsHeaders();
    const body = await request.json();
    
    // 数据验证
    if (!body.name || !body.scene || !body.fileUrl) {
      return Response.json({ error: '缺少必要字段' }, { status: 400, headers });
    }
    
    const model = await prisma.model3D.create({
      data: {
        name: body.name,
        description: body.description || null,
        scene: body.scene,
        fileUrl: body.fileUrl,
        thumbnail: body.thumbnail || null
      }
    });
    
    return Response.json(model, { status: 201, headers });
  } catch (error) {
    console.error('添加模型错误:', error);
    return Response.json({ error: '服务器内部错误' }, { status: 500 });
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