import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get todos count
    const { count: totalTodos } = await supabase
      .from('todos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id);

    // Get completed todos count
    const { count: completedTodos } = await supabase
      .from('todos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('completed', true);

    // Get posts count
    const { count: totalPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id);

    return NextResponse.json({
      totalTodos: totalTodos || 0,
      completedTodos: completedTodos || 0,
      totalPosts: totalPosts || 0
    });
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 