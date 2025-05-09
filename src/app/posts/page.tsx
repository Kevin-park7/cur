'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  views: number;
  user_id: string;
  is_deleted: boolean;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log('Fetching posts...');
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching posts:', error);
          return;
        }

        console.log('Posts fetched successfully:', data);
        setPosts(data || []);
      } catch (error) {
        console.error('Error in fetchPosts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user, authLoading, router, supabase]);

  async function handleDelete(postId: string) {
    try {
      console.log('Attempting to delete post:', postId);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session found, redirecting to login');
        alert('로그인이 필요합니다.');
        router.push('/auth/login');
        return;
      }

      const { error } = await supabase
        .from('posts')
        .update({ is_deleted: true })
        .eq('id', postId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error deleting post:', error);
        alert('게시글 삭제 중 오류가 발생했습니다.');
        return;
      }

      console.log('Post deleted successfully');
      await fetchPosts();
    } catch (error) {
      console.error('Error in handleDelete:', error);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // 리다이렉트 중이므로 아무것도 표시하지 않음
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500 py-8">
          {error}
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => fetchPosts()}
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">게시판</h1>
        <Button 
          onClick={() => router.push('/posts/create')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          글쓰기
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">게시글이 없습니다.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/posts/create')}
          >
            첫 게시글 작성하기
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">제목</TableHead>
                <TableHead className="w-[20%]">작성일</TableHead>
                <TableHead className="w-[15%]">조회수</TableHead>
                <TableHead className="w-[15%]">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id} className="hover:bg-gray-50">
                  <TableCell>
                    <a
                      href={`/posts/${post.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {post.title}
                    </a>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(post.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-gray-600">{post.views}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/posts/${post.id}/edit`)}
                        className="hover:bg-gray-100"
                      >
                        수정
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="hover:bg-red-700"
                      >
                        삭제
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 