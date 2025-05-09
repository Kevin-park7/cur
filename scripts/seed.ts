import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const testUser = await prisma.profile.create({
    data: {
      username: 'testuser',
      fullName: '테스트 사용자',
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

  // Create test post
  const testPost = await prisma.post.create({
    data: {
      title: '테스트 게시글',
      content: '이것은 테스트 게시글입니다.',
      authorId: testUser.id,
      status: 'PUBLISHED',
      publishedAt: new Date()
    }
  });

  // Create test comment
  await prisma.comment.create({
    data: {
      content: '테스트 댓글입니다.',
      authorId: testUser.id,
      postId: testPost.id
    }
  });

  // Create test todo
  await prisma.todo.create({
    data: {
      title: '테스트 할일',
      description: '이것은 테스트 할일입니다.',
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