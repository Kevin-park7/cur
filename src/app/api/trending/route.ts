import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, views, created_at, user_id')
      .gte('created_at', since.toISOString())
      .order('views', { ascending: false })
      .limit(10);
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: '트렌딩 데이터 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 