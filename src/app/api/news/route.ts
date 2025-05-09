import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface NewsInput {
  title: string;
  content: string;
  url: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const newsList: NewsInput[] = await request.json();
    const created = await prisma.news.createMany({
      data: newsList.map((news: NewsInput) => ({
        title: news.title,
        content: news.content,
        url: news.url,
        imageUrl: news.imageUrl || null,
        source: news.source,
        publishedAt: new Date(news.publishedAt)
      })),
      skipDuplicates: true
    });
    return Response.json({ success: true, count: created.count });
  } catch (error) {
    return Response.json({ error: 'DB 저장 실패', detail: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const news = await prisma.post.findMany({
      where: {
        status: 'published',
        isDeleted: false
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 10
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
} 