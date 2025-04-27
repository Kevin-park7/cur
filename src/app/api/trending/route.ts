import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  // 실시간 순위 100위까지 가져오기
  const trending = await prisma.trending.findMany({
    orderBy: { rank: 'asc' },
    take: 100,
  });

  return NextResponse.json({ trending });
} 