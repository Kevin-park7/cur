import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password, fullName } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.profile.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.profile.create({
      data: {
        username,
        password: hashedPassword,
        fullName: fullName || username,
        role: 'USER',
        level: 1,
        points: 0,
        userSettings: {
          create: {
            theme: 'light',
            language: 'en',
            notifications: true
          }
        }
      }
    });

    return NextResponse.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    );
  }
} 