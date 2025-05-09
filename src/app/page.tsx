'use client';

import { FaSearch, FaNewspaper, FaChartLine, FaTasks, FaGamepad, FaUserCircle } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {user ? (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {user.username}님, 환영합니다!
                  </h2>
                  <p className="text-gray-600">
                    오늘도 좋은 하루 되세요. 어떤 일을 하고 싶으신가요?
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {/* 할 일 목록 카드 */}
                  <Link href="/todo" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FaTasks className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              할 일 목록
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                오늘의 할 일을 관리하세요
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* 게시판 카드 */}
                  <Link href="/board" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FaNewspaper className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              게시판
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                커뮤니티에 참여하세요
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* 게임 카드 */}
                  <Link href="/games" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FaGamepad className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              게임
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                즐거운 게임을 즐겨보세요
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* 프로필 카드 */}
                  <Link href="/profile" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FaUserCircle className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              프로필
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                내 정보를 관리하세요
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* 통계 카드 */}
                  <Link href="/dashboard" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FaChartLine className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              통계
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                활동 내역을 확인하세요
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                  My Space에 오신 것을 환영합니다
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  할 일 관리, 게시판, 게임 등 다양한 기능을 즐겨보세요
                </p>
                <div className="space-x-4">
                  <Link
                    href="/auth/login"
                    className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/auth/register"
                    className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-md text-lg font-medium border border-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    회원가입
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
} 