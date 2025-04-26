import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 테스트 사용자 생성
  const testUserPassword = await bcrypt.hash('password123', 10);
  const testUser = await prisma.user.create({
    data: {
      name: '테스트 사용자',
      email: 'test@example.com',
      password: testUserPassword
    }
  });

  // 성원 계정 생성
  const seongwonPassword = await bcrypt.hash('password123', 10);
  const seongwon = await prisma.user.create({
    data: {
      name: '성원',
      email: 'seongwon@example.com',
      password: seongwonPassword
    }
  });

  // 테스트 사용자의 할 일 생성
  const testUserTodos = [];
  for (let i = 1; i <= 100; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    testUserTodos.push({
      text: `테스트 사용자의 할 일 ${i}`,
      completed: Math.random() > 0.5,
      date,
      authorId: testUser.id
    });
  }
  await prisma.todo.createMany({ data: testUserTodos });

  // 성원의 할 일 생성
  const seongwonTodos = [];
  for (let i = 1; i <= 100; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    seongwonTodos.push({
      text: `성원의 할 일 ${i}`,
      completed: Math.random() > 0.5,
      date,
      authorId: seongwon.id
    });
  }
  await prisma.todo.createMany({ data: seongwonTodos });

  // 테스트 사용자의 게시글 생성
  const testUserPosts = [];
  for (let i = 1; i <= 100; i++) {
    testUserPosts.push({
      title: `테스트 사용자의 게시글 ${i}`,
      content: `테스트 사용자의 게시글 내용 ${i}`,
      authorId: testUser.id
    });
  }
  await prisma.post.createMany({ data: testUserPosts });

  // 성원의 게시글 생성
  const seongwonPosts = [];
  for (let i = 1; i <= 100; i++) {
    seongwonPosts.push({
      title: `성원의 게시글 ${i}`,
      content: `성원의 게시글 내용 ${i}`,
      authorId: seongwon.id
    });
  }
  await prisma.post.createMany({ data: seongwonPosts });

  console.log('데이터 생성 완료!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 