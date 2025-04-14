import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { getCorsHeaders } from '@/lib/auth';

const prisma = new PrismaClient();

// 定义请求体验证的schema
const loginSchema = z.object({
  code: z.string().min(1, { message: "微信登录code不能为空" })
});

export async function POST(request: NextRequest) {
  try {
    // 设置CORS头部
    const headers = getCorsHeaders();

    console.log('收到登录请求，开始处理...');
    console.log('请求方法:', request.method);
    console.log('请求头:', Object.fromEntries(request.headers.entries()));

    // 解析请求体
    const body = await request.json().catch(e => {
      console.error('JSON解析错误:', e);
      return {};
    });

    console.log('请求体:', body);

    // 验证请求体
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      console.error('验证失败:', validation.error);
      return Response.json({ error: '无效的请求参数' }, { status: 400, headers });
    }

    const { code } = validation.data;

    // 获取微信小程序配置
    const appid = process.env.WECHAT_APPID;
    const secret = process.env.WECHAT_SECRET;

    console.log('微信配置:', { appid: appid?.substring(0, 3) + '***', secret: secret ? '已配置' : '未配置' });

    if (!appid || !secret) {
      return Response.json({ error: '服务器配置错误' }, { status: 500, headers });
    }

    // 请求微信API获取openid
    const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    console.log('请求微信API:', wxUrl.replace(secret, '***'));

    try {
      const wxResponse = await fetch(wxUrl);
      const wxData = await wxResponse.json();

      console.log('微信API响应:', wxData);

      if (wxData.errcode) {
        return Response.json({ error: '微信登录失败', code: wxData.errcode }, { status: 401, headers });
      }

      const { openid } = wxData;

      if (!openid) {
        console.error('微信返回数据缺少openid:', wxData);
        return Response.json({ error: '微信登录失败，缺少openid' }, { status: 401, headers });
      }

      // 查找或创建用户
      let user = await prisma.user.findUnique({
        where: { openId: openid }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            openId: openid
          }
        });
      }

      // 生成JWT
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '30d' }
      );

      return Response.json({ token, userId: user.id }, { headers });
    } catch (error) {
      console.error('登录错误:', error);
      return Response.json({ error: '服务器内部错误' }, { status: 500 });
    }
  } catch (error) {
    console.error('登录错误:', error);
    return Response.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// 处理预检请求
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders()
  });
} 