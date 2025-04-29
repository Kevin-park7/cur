'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

interface UserSettings {
  theme: string;
  layout: {
    searchBar: { enabled: boolean; position: string };
    todoList: { enabled: boolean; position: string };
    board: { enabled: boolean; position: string };
    games: { enabled: boolean; position: string };
  };
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    layout: {
      searchBar: { enabled: true, position: 'top' },
      todoList: { enabled: true, position: 'left' },
      board: { enabled: true, position: 'right' },
      games: { enabled: true, position: 'bottom' },
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleLayoutChange = (
    component: keyof UserSettings['layout'],
    property: 'enabled' | 'position',
    value: boolean | string
  ) => {
    setSettings((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        [component]: {
          ...prev.layout[component],
          [property]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    // TODO: Implement settings save functionality
  };

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
              <h1 className="text-2xl font-bold text-gray-900 mb-6">설정</h1>

              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">테마 설정</h2>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="light">라이트 모드</option>
                    <option value="dark">다크 모드</option>
                  </select>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4">레이아웃 설정</h2>
                  <div className="space-y-4">
                    {Object.entries(settings.layout).map(([component, config]) => (
                      <div key={component} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">
                            {component === 'searchBar'
                              ? '검색창'
                              : component === 'todoList'
                              ? '할 일 목록'
                              : component === 'board'
                              ? '게시판'
                              : '게임'}
                          </h3>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={config.enabled}
                              onChange={(e) =>
                                handleLayoutChange(
                                  component as keyof UserSettings['layout'],
                                  'enabled',
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">활성화</span>
                          </label>
                        </div>
                        {config.enabled && (
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700">
                              위치
                            </label>
                            <select
                              value={config.position}
                              onChange={(e) =>
                                handleLayoutChange(
                                  component as keyof UserSettings['layout'],
                                  'position',
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                              <option value="top">상단</option>
                              <option value="left">좌측</option>
                              <option value="right">우측</option>
                              <option value="bottom">하단</option>
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    저장
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 