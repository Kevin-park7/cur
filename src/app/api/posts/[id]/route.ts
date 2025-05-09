import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  context: any
) {
  const id = context.params.id;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        comments: {
          include: {
            author: true
          }
        }
      }
    });

    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    return Response.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: any
) {
  const id = context.params.id;
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content, status } = body;

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
        status,
        updatedAt: new Date()
      }
    });

    return Response.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: any
) {
  const id = context.params.id;
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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

    await prisma.post.delete({
      where: { id }
    });

    return Response.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 