import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { id } = params;
  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: '할 일을 찾을 수 없습니다.' }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: '할 일 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { id } = params;
  try {
    const { title, description, due_date, priority, status } = await request.json();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
    const { error } = await supabase
      .from('todos')
      .update({ title, description, due_date, priority, status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
    return NextResponse.json({ message: '수정 완료' });
  } catch (error) {
    return NextResponse.json({ error: '할 일 수정 중 오류가 발생했습니다.' }, { status: 500 });
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
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
    return NextResponse.json({ message: '삭제 완료' });
  } catch (error) {
    return NextResponse.json({ error: '할 일 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 