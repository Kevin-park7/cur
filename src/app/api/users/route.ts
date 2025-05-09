import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if the current user is an admin
    const currentUser = await prisma.profile.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const users = await prisma.profile.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        level: true,
        points: true,
        createdAt: true
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if the current user is an admin
    const currentUser = await prisma.profile.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { id, role, level, points } = await request.json();

    const user = await prisma.profile.update({
      where: { id },
      data: { role, level, points },
      select: {
        id: true,
        username: true,
        role: true,
        level: true,
        points: true,
        createdAt: true
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 