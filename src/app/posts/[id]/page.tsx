'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

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

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchPost();
  }, [params.id]);

  async function fetchPost() {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching post details for ID:', params.id);

      const { data: { session } } = await supabase.auth.getSession();
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', params.id)
        .eq('is_deleted', false)
        .single();

      if (fetchError) {
        console.error('Error fetching post:', fetchError);
        throw fetchError;
      }

      if (!data) {
        console.log('Post not found');
        setError('게시글을 찾을 수 없습니다.');
        return;
      }

      console.log('Post fetched successfully:', data);
      setPost(data);
      setIsAuthor(session?.user.id === data.user_id);
      console.log('Is author:', session?.user.id === data.user_id);

      // 조회수 증가
      console.log('Incrementing view count...');
      const { error: updateError } = await supabase
        .from('posts')
        .update({ views: data.views + 1 })
        .eq('id', params.id);

      if (updateError) {
        console.error('Error updating view count:', updateError);
      } else {
        console.log('View count updated successfully');
      }
    } catch (error) {
      console.error('Error in fetchPost:', error);
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      console.log('Delete cancelled by user');
      return;
    }

    try {
      console.log('Attempting to delete post:', params.id);
      const { error } = await supabase
        .from('posts')
        .update({ is_deleted: true })
        .eq('id', params.id);

      if (error) {
        console.error('Error deleting post:', error);
        throw error;
      }

      console.log('Post deleted successfully');
      router.push('/posts');
    } catch (error) {
      console.error('Error in handleDelete:', error);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    }
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

  if (error || !post) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500 py-8">
          {error || '게시글을 찾을 수 없습니다.'}
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/posts')}
          >
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
              <div className="flex gap-2">
                {isAuthor && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/posts/${post.id}/edit`)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                    >
                      삭제
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-500 mb-6">
              <span>작성일: {new Date(post.createdAt).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span>조회수: {post.views}</span>
            </div>

            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => router.push('/posts')}
          >
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
} 