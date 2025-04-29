'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {post ? (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
                  <div className="mb-4 text-sm text-gray-500">
                    작성자: {post.author.name} | 작성일: {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                  <div className="prose max-w-none">{post.content}</div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">게시글을 찾을 수 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 