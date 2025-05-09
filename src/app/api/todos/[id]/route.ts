import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;
    const { title, description, status, priority, dueDate } = await request.json();

    const todo = await prisma.todo.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!todo) {
      return new NextResponse('Todo not found', { status: 404 });
    }

    if (todo.userId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;

    const todo = await prisma.todo.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!todo) {
      return new NextResponse('Todo not found', { status: 404 });
    }

    if (todo.userId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    await prisma.todo.delete({
      where: { id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 