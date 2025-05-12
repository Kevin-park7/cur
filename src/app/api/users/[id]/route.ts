import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { id } = params;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, email, created_at, updated_at')
      .eq('id', id)
      .single();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: '사용자 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: any
) {
  const id = context.params.id;
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const body = await request.json();
    const { level } = body;

    const { data, error } = await supabase
      .from('profiles')
      .update({ level })
      .eq('id', id)
      .select('id, username, full_name, email, created_at, updated_at')
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: '사용자 업데이트 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 