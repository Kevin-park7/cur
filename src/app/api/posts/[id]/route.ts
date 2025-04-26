import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/auth';

export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching post' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    if (post.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting post' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    if (post.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { title, content } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }
    const updatedPost = await prisma.post.update({
      where: { id },
      data: { title, content },
      include: { user: { select: { name: true, email: true } } }
    });
    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating post' }, { status: 500 });
  }
} 