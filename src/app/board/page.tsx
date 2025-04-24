'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

interface User {
  name: string;
  email: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  user: User;
  createdAt: string;
}

interface CustomSession extends Session {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
}

export default function BoardPage() {
  const { data: session }: { data: CustomSession | null } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    fetchPosts();
  }, [session]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        const res = await fetch('/api/posts', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });

        if (res.ok) {
          fetchPosts();
        }
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) return;

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          userEmail: session.user.email,
        }),
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">게시판</h1>
              <button
                onClick={() => router.push('/board/new')}
                className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-sky-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                글쓰기
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">게시글을 불러오는 중...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {post.title}
                      </h2>
                      {session.user?.email === post.user.email && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/board/${post.id}/edit`)}
                            className="text-sky-600 hover:text-sky-700 transition-colors duration-300"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-500 hover:text-red-600 transition-colors duration-300"
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{post.content}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{post.user.name}</span>
                      <span className="mx-2">•</span>
                      <span>
                        {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                placeholder="내용"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 border rounded h-32"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                글 작성
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 