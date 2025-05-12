'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Comment } from '@/lib/supabase';

interface CommentsProps {
  postId: string;
}

export default function CommentsComponent({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            content: newComment,
            post_id: postId,
            user_id: user.id
          }
        ])
        .select(`
          *,
          profiles:user_id (
            username,
            full_name
          )
        `)
        .single();

      if (error) throw error;

      setComments([...comments, data]);
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setComments(comments.filter(comment => comment.id !== id));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">댓글</h2>
      
      {user && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성하세요..."
              className="flex-1 border p-2 rounded"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              작성
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {comment.profiles?.full_name || comment.profiles?.username}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-gray-700">{comment.content}</p>
              </div>
              {user?.id === comment.user_id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 