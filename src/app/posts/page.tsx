'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { useSession } from 'next-auth/react';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  status: string;
  views: number;
  likesCount: number;
  commentsCount: number;
  isFeatured: boolean;
  isDeleted: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  categoryId?: string;
  author: {
    username?: string;
    fullName?: string;
  };
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchPosts();
    }
  }, [status, router, fetchPosts]);

  const handleDelete = async (postId: string) => {
    try {
      if (!session?.user) {
        alert('로그인이 필요합니다.');
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      console.log('Post deleted successfully');
      await fetchPosts();
    } catch (error) {
      console.error('Error in handleDelete:', error);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
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
            onClick={fetchPosts}
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
                    {new Date(post.createdAt).toLocaleDateString()}
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