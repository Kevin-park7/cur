'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Post } from '@/lib/supabase';
import Comments from './Comments';

export default function PostsComponent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    category_id: ''
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            ...newPost,
            user_id: user.id,
            status: 'published',
            is_deleted: false,
            published_at: new Date().toISOString()
          }
        ])
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
        .single();

      if (error) throw error;

      setPosts([data, ...posts]);
      setNewPost({ title: '', content: '', excerpt: '', category_id: '' });
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_deleted: true })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">게시글</h1>
      
      {user && (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="제목"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <textarea
              placeholder="내용"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <textarea
              placeholder="요약"
              value={newPost.excerpt}
              onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="카테고리 ID"
              value={newPost.category_id}
              onChange={(e) => setNewPost({ ...newPost, category_id: e.target.value })}
              className="border p-2 rounded"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              작성
            </button>
          </div>
        </form>
      )}

      <div className="space-y-8">
        {posts.map((post) => (
          <div
            key={post.id}
            className="border p-6 rounded shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{post.title}</h2>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <span>{post.profiles?.full_name || post.profiles?.username}</span>
                  <span>•</span>
                  <span>{new Date(post.published_at).toLocaleString()}</span>
                  <span>•</span>
                  <span>{post.comments?.length || 0}개의 댓글</span>
                </div>
                {post.excerpt && (
                  <p className="mt-2 text-gray-600">{post.excerpt}</p>
                )}
                <p className="mt-4 text-gray-700">{post.content}</p>
              </div>
              {user?.id === post.user_id && (
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  삭제
                </button>
              )}
            </div>
            <Comments postId={post.id} />
          </div>
        ))}
      </div>
    </div>
  );
} 