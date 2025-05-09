import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth';

interface NewsInput {
  title: string;
  content: string;
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
        excerpt: news.content.substring(0, 200),
        authorId: session.user.id,
        status: 'PUBLISHED',
        publishedAt: new Date(news.publishedAt),
        isDeleted: false
      })),
      skipDuplicates: true
    });
    return NextResponse.json({ success: true, count: created.count });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json({ error: 'Error creating news' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const news = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        isDeleted: false
      },
      include: {
        author: {
          select: {
            username: true,
            fullName: true
          }
        }
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