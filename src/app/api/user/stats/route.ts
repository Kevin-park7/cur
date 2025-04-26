import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [totalTodos, completedTodos, totalPosts] = await Promise.all([
      prisma.todo.count({
        where: { authorId: session.user.id }
      }),
      prisma.todo.count({
        where: {
          authorId: session.user.id,
          completed: true
        }
      }),
      prisma.post.count({
        where: { authorId: session.user.id }
      })
    ]);

    return NextResponse.json({
      totalTodos,
      completedTodos,
      totalPosts
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching user stats' },
      { status: 500 }
    );
  }
} 