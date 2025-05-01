'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaNewspaper, FaChartLine } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* 검색 카드 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaSearch className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        검색
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          실시간 검색어
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* 뉴스 카드 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaNewspaper className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        뉴스
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          최신 뉴스
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* 트렌드 카드 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaChartLine className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        트렌드
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          인기 트렌드
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-8">
            <h1 className="text-4xl font-bold">Welcome</h1>
            <nav className="flex gap-4">
              <Link 
                href="/posts" 
                className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors"
              >
                게시판
              </Link>
              <Link 
                href="/todos" 
                className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors"
              >
                할 일 목록
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
} 