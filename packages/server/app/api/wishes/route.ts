import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCorsHeaders, verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// 预设祝福语（每种类型8个）
const BLESSINGS: Record<string, string[]> = {
  'love': [
    '天长地久，比翼齐飞',
    '相濡以沫，白首不离',
    '情深似海，心心相印',
    '执子之手，与子偕老',
    '浓情蜜意，此生不渝',
    '山盟海誓，永结同心',
    '两情相悦，百年好合',
    '缘定三生，白头偕老'
  ],
  'career': [
    '前程似锦，步步高升',
    '金榜题名，马到成功',
    '鹏程万里，壮志凌云',
    '学业有成，事业有成',
    '才华横溢，大展宏图',
    '志存高远，所向披靡',
    '功成名就，蒸蒸日上',
    '前途无量，青云直上'
  ],
  'health': [
    '健康长寿，平安喜乐',
    '福如东海，寿比南山',
    '身体健壮，延年益寿',
    '安康幸福，无病无灾',
    '吉祥如意，健康快乐',
    '福寿安康，幸福美满',
    '百病不侵，平安长寿',
    '岁岁平安，生生不息'
  ],
  'wealth': [
    '财源广进，富贵满堂',
    '金玉满堂，财源滚滚',
    '招财进宝，富甲一方',
    '钱财广进，日进斗金',
    '财源茂盛，家业兴旺',
    '八方来财，富贵荣华',
    '生意兴隆，财源广进',
    '和气生财，鸿运当头'
  ],
  'family': [
    '家和万事，兴旺发达',
    '阖家欢乐，幸福美满',
    '六和家顺，五福临门',
    '家庭和睦，其乐融融',
    '家兴人和，福寿双全',
    '平安喜乐，家庭幸福',
    '阖家康泰，四季平安',
    '家和业兴，幸福安康'
  ]
};

/**
 * 随机获取祝福语
 */
export async function GET(request: NextRequest) {
  try {
    const headers = getCorsHeaders();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'love';
    
    // 验证类型是否有效
    if (!BLESSINGS[type]) {
      return Response.json(
        { error: '无效的愿望类型' }, 
        { status: 400, headers }
      );
    }
    
    // 随机选择一个祝福语
    const blessings = BLESSINGS[type];
    const randomIndex = Math.floor(Math.random() * blessings.length);
    const blessing = blessings[randomIndex];
    
    // 分成两部分（每4个字一组）
    const parts = [blessing.substring(0, 4), blessing.substring(4)];
    
    return Response.json({ blessing, parts }, { headers });
  } catch (error) {
    console.error('获取祝福语错误:', error);
    return Response.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

/**
 * 提交许愿
 */
export async function POST(request: NextRequest) {
  try {
    const headers = getCorsHeaders();
    
    // 验证用户身份
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.userId) {
      return Response.json(
        { error: authResult.error || '用户ID不存在' }, 
        { status: authResult.status || 401, headers }
      );
    }
    
    const body = await request.json();
    
    // 验证请求体
    if (!body.type || !BLESSINGS[body.type]) {
      return Response.json(
        { error: '无效的愿望类型' }, 
        { status: 400, headers }
      );
    }
    
    // 创建愿望记录
    const wish = await prisma.wish.create({
      data: {
        type: body.type,
        content: body.content || null,
        userId: authResult.userId!
      }
    });
    
    // 随机选择一个祝福语
    const blessings = BLESSINGS[body.type];
    const randomIndex = Math.floor(Math.random() * blessings.length);
    const blessing = blessings[randomIndex];
    
    // 分成两部分（每4个字一组）
    const parts = [blessing.substring(0, 4), blessing.substring(4)];
    
    return Response.json(
      { wish, blessing, parts }, 
      { status: 201, headers }
    );
  } catch (error) {
    console.error('提交愿望错误:', error);
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