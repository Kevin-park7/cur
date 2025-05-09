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

export default function EditPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchPost();
  }, [params.id]);

  async function fetchPost() {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching post for editing, ID:', params.id);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session found, redirecting to login');
        setError('로그인이 필요합니다.');
        router.push('/auth/login');
        return;
      }

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

      if (data.user_id !== session.user.id) {
        console.log('User is not the author of the post');
        setError('수정 권한이 없습니다.');
        return;
      }

      console.log('Post fetched successfully:', data);
      setPost(data);
      setTitle(data.title);
      setContent(data.content);
    } catch (error) {
      console.error('Error in fetchPost:', error);
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      console.log('Validation failed: empty title or content');
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      console.log('Attempting to update post:', params.id);

      const { error: updateError } = await supabase
        .from('posts')
        .update({
          title: title.trim(),
          content: content.trim()
        })
        .eq('id', params.id);

      if (updateError) {
        console.error('Error updating post:', updateError);
        throw updateError;
      }

      console.log('Post updated successfully');
      router.push(`/posts/${params.id}`);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError('게시글 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">게시글 수정</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="제목을 입력하세요"
              disabled={saving}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="내용을 입력하세요"
              disabled={saving}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  저장 중...
                </>
              ) : (
                '저장하기'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 