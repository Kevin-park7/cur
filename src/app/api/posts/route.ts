import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles:user_id (username, full_name), comments (id)')
      .eq('status', 'published')
      .eq('is_deleted', false)
      .order('published_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: '게시글 목록 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { title, content, excerpt, category_id } = await request.json();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          title,
          content,
          excerpt,
          category_id,
          user_id: user.id,
          status: 'published',
          is_deleted: false,
          published_at: new Date().toISOString(),
        },
      ])
      .select('*, profiles:user_id (username, full_name), comments (id)')
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: '게시글 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, title, content } = await request.json();

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        excerpt: content.substring(0, 200),
        updatedAt: new Date()
      },
      include: {
        author: true
      }
    });

    return Response.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 