import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const trending = await prisma.trending.findMany({
      orderBy: { rank: 'asc' },
      take: 100,
    });

    return NextResponse.json(trending);
  } catch (error) {
    console.error('Error fetching trending:', error);
    return NextResponse.json(
      { error: 'Error fetching trending' },
      { status: 500 }
    );
  }
} 