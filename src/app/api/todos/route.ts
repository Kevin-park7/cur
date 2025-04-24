import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

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

    const todos = await prisma.todo.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching todos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { text, date } = await request.json();

    if (!text || !date) {
      return NextResponse.json(
        { error: 'Text and date are required' },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.create({
      data: {
        text,
        date: new Date(date),
        userId: session.user.id
      }
    });

    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating todo' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, completed } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Todo ID is required' },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.update({
      where: {
        id,
        userId: session.user.id
      },
      data: {
        completed
      }
    });

    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error updating todo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Todo ID is required' },
        { status: 400 }
      );
    }

    await prisma.todo.delete({
      where: {
        id,
        userId: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error deleting todo' },
      { status: 500 }
    );
  }
} 