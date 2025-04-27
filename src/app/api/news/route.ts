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

export async function GET(req: Request) {
  // 오늘 날짜 기준
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 오늘의 뉴스 100개 가져오기 (중복 제거)
  const news = await prisma.news.findMany({
    where: {
      publishedAt: {
        gte: today,
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: 200, // 넉넉히 가져와서 중복 제거
  });

  // 제목+내용 기준 중복 제거
  const uniqueNews: typeof news = [];
  const seen = new Set<string>();
  for (const n of news) {
    const key = n.title + n.content;
    if (!seen.has(key)) {
      uniqueNews.push(n);
      seen.add(key);
    }
    if (uniqueNews.length >= 100) break;
  }

  return NextResponse.json({ news: uniqueNews });
} 