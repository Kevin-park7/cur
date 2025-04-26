import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  const id = context.params.id;
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== 'ADMIN')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { level } = body;

    const user = await prisma.user.update({
      where: { id },
      data: { level },
    });

    return Response.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 