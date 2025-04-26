import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const settings = await prisma.userSettings.findUnique({
      where: {
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json(settings || { theme: 'light', layout: {} });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { theme, layout } = body;

    const settings = await prisma.userSettings.upsert({
      where: {
        userId: (session.user as any).id,
      },
      update: {
        theme,
        layout,
      },
      create: {
        userId: (session.user as any).id,
        theme,
        layout,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 