'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Post } from '@/lib/supabase';

// Post 타입 확장
interface ExtendedPost extends Post {
  profiles?: {
    username: string;
    full_name: string;
  };
  comments?: { id: string }[];
}

export default function PostsPage() {
  const [posts, setPosts] = useState<ExtendedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name
          ),
          comments (
            id
          )
        `)
        .eq('status', 'published')
        .eq('is_deleted', false)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_deleted: true })
        .eq('id', postId)
        .eq('user_id', user.id);
      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      alert('게시글 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">내 게시글</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{post.title}</h2>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <span>{post.profiles?.full_name || post.profiles?.username}</span>
                  <span>•</span>
                  <span>{new Date(post.published_at || post.created_at).toLocaleString()}</span>
                  <span>•</span>
                  <span>{post.comments?.length || 0}개의 댓글</span>
                </div>
                {post.excerpt && (
                  <p className="mt-2 text-gray-600">{post.excerpt}</p>
                )}
                <p className="mt-4 text-gray-700">{post.content}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/board/${post.id}/edit`)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 