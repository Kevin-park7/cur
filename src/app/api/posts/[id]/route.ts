import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { id } = params;
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`*, profiles:user_id (username, full_name), comments (id)`)
      .eq('id', id)
      .single();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: '게시글 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { id } = params;
  try {
    const { title, content } = await request.json();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
    const { error } = await supabase
      .from('posts')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
    return NextResponse.json({ message: '수정 완료' });
  } catch (error) {
    return NextResponse.json({ error: '게시글 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { id } = params;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
    const { error } = await supabase
      .from('posts')
      .update({ is_deleted: true })
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
    return NextResponse.json({ message: '삭제 완료' });
  } catch (error) {
    return NextResponse.json({ error: '게시글 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 