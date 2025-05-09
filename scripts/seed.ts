import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 테스트 사용자 생성
  const testUserPassword = await bcrypt.hash('password123', 10);
  const testUser = await prisma.profile.create({
    data: {
      username: 'testuser',
      fullName: '테스트 사용자',
      email: 'test@example.com',
      role: 'USER',
      level: 1,
      points: 0,
      userSettings: {
        create: {
          emailNotifications: true,
          pushNotifications: true,
          theme: 'light',
          language: 'ko'
        }
      }
    }
  });

  // 테스트 게시물 생성
  const testPost = await prisma.post.create({
    data: {
      title: '테스트 게시물',
      content: '이것은 테스트 게시물입니다.',
      authorId: testUser.id,
      status: 'published',
      publishedAt: new Date()
    }
  });

  // 테스트 댓글 생성
  await prisma.comment.create({
    data: {
      content: '테스트 댓글입니다.',
      authorId: testUser.id,
      postId: testPost.id
    }
  });

  // 테스트 할 일 생성
  await prisma.todo.create({
    data: {
      title: '테스트 할 일',
      description: '이것은 테스트 할 일입니다.',
      priority: 'medium',
      status: 'pending',
      userId: testUser.id
    }
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 