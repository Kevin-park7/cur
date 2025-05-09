import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth';

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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const newsList: NewsInput[] = await request.json();
    const created = await prisma.post.createMany({
      data: newsList.map((news: NewsInput) => ({
        title: news.title,
        content: news.content,
        url: news.url,
        imageUrl: news.imageUrl || null,
        source: news.source,
        authorId: session.user.id,
        status: 'PUBLISHED',
        publishedAt: new Date(news.publishedAt)
      })),
      skipDuplicates: true
    });
    return Response.json({ success: true, count: created.count });
  } catch (error) {
    console.error('Error creating news:', error);
    return Response.json({ error: 'Error creating news' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const news = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null
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
      { error: 'Error fetching news' },
      { status: 500 }
    );
  }
} 