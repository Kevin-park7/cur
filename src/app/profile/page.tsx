'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

interface UserStats {
  totalTodos: number;
  completedTodos: number;
  totalPosts: number;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    totalTodos: 0,
    completedTodos: 0,
    totalPosts: 0
  });

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
              <div className="flex items-center mb-6">
                <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
                  {user.username?.[0].toUpperCase()}
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                  <p className="text-gray-500">회원</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-700">전체 할 일</h3>
                  <p className="text-2xl font-bold text-indigo-600">{stats.totalTodos}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-700">완료된 할 일</h3>
                  <p className="text-2xl font-bold text-green-600">{stats.completedTodos}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-700">작성한 게시글</h3>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalPosts}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 