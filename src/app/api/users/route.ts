import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, email, created_at, updated_at');
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: '사용자 목록 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { id, role, level, points } = await request.json();
    const { data, error } = await supabase
      .from('profiles')
      .update({ role, level, points })
      .eq('id', id)
      .select('id, username, role, level, points, created_at')
      .single();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: '사용자 업데이트 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 