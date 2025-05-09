import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        isDeleted: false
      },
      include: {
        author: true,
        comments: {
          include: {
            author: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });

    return Response.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return Response.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        excerpt: content.substring(0, 200),
        authorId: session.user.id,
        status: 'DRAFT',
        publishedAt: null,
        isDeleted: false
      },
      include: {
        author: true
      }
    });

    return Response.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, title, content } = await request.json();

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        excerpt: content.substring(0, 200),
        updatedAt: new Date()
      },
      include: {
        author: true
      }
    });

    return Response.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 