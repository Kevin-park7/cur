import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null
      },
      include: {
        author: true,
        comments: {
          include: {
            author: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });

    return Response.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return Response.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        status: 'DRAFT',
        publishedAt: null
      },
      include: {
        author: true
      }
    });

    return Response.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await request.json();

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) throw error;

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id, title, content } = await request.json();

    const { data, error } = await supabase
      .from('posts')
      .update({ title, content })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select(`
        *,
        author:user_id (
          email,
          user_metadata->>name as name
        )
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 