import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/auth';
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
        author: { select: { name: true, email: true } }
      }
    });
    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }
    return Response.json(post);
  } catch (error) {
    return Response.json({ error: 'Error fetching post' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: any
) {
  const id = context.params.id;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }
    if (post.authorId !== session.user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await prisma.post.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Error deleting post' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: any
) {
  const id = context.params.id;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }
    if (post.authorId !== session.user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { title, content } = await request.json();
    if (!title || !content) {
      return Response.json({ error: 'Title and content are required' }, { status: 400 });
    }
    const updatedPost = await prisma.post.update({
      where: { id },
      data: { title, content },
      include: { author: { select: { name: true, email: true } } }
    });
    return Response.json(updatedPost);
  } catch (error) {
    return Response.json({ error: 'Error updating post' }, { status: 500 });
  }
} 