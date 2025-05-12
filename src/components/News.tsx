'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { News } from '@/lib/supabase';

export default function NewsComponent() {
  const [news, setNews] = useState<News[]>([]);
  const [newNews, setNewNews] = useState({ title: '', content: '', url: '', source: '' });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNews();
    }
  }, [user]);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('news')
        .insert([
          {
            ...newNews,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setNews([data, ...news]);
      setNewNews({ title: '', content: '', url: '', source: '' });
    } catch (error) {
      console.error('Error creating news:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNews(news.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">뉴스</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="제목"
            value={newNews.title}
            onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <textarea
            placeholder="내용"
            value={newNews.content}
            onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="url"
            placeholder="URL"
            value={newNews.url}
            onChange={(e) => setNewNews({ ...newNews, url: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="출처"
            value={newNews.source}
            onChange={(e) => setNewNews({ ...newNews, source: e.target.value })}
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            추가
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {news.map((item) => (
          <div
            key={item.id}
            className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-gray-600 mt-2">{item.content}</p>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-sm mt-2 inline-block"
                  >
                    원문 보기
                  </a>
                )}
                {item.source && (
                  <p className="text-sm text-gray-500 mt-2">
                    출처: {item.source}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  작성일: {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 