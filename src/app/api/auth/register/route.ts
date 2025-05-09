import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new NextResponse('아이디와 비밀번호를 입력해주세요.', { status: 400 });
    }

    const existingUser = await prisma.profile.findUnique({
      where: { username }
    });

    if (existingUser) {
      return new NextResponse('이미 존재하는 아이디입니다.', { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.profile.create({
      data: {
        username,
        fullName: username,
        password: hashedPassword,
        role: 'USER'
      }
    });

    return NextResponse.json({
      id: user.id,
      username: user.username,
      name: user.fullName
    });
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 