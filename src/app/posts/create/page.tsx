'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      alert('로그인이 필요합니다.');
      router.push('/auth/login');
      return;
    }

    const { error } = await supabase
      .from('posts')
      .insert([
        {
          title,
          content,
          user_id: session.user.id
        }
      ]);

    if (error) {
      console.error('Error creating post:', error);
      return;
    }

    router.push('/posts');
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">새 글 작성</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            제목
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            내용
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            required
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit">
            저장
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/posts')}
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  );
} 