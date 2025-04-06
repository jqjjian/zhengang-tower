import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return Response.json({ message: 'Hello, 振钢大厦!' });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  
  return Response.json({
    message: '数据已接收',
    receivedData: body,
    timestamp: new Date().toISOString()
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
} 