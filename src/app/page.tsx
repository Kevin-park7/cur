'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import Image from 'next/image';
import axios from 'axios';
import { FaSearch, FaNewspaper, FaChartLine } from 'react-icons/fa';

interface NewsArticle {
  url: string;
  title: string;
  description: string;
}

interface TrendingTopic {
  title: string;
  searchCount: number;
}

// 배경 이미지 URL 배열
const backgroundImages = [
  '/backgrounds/news1.jpg',
  '/backgrounds/news2.jpg',
  '/backgrounds/news3.jpg',
  '/backgrounds/news4.jpg',
  // 더 많은 배경 이미지 추가 가능
];

export default function Home() {
  const [currentBg, setCurrentBg] = useState(0);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { data: session } = useSession();

  // 배경 이미지 자동 변경
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
    }, 30000); // 30초마다 변경

    return () => clearInterval(timer);
  }, []);

  // 뉴스 데이터 가져오기
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
          params: {
            country: 'kr',
            apiKey: process.env.NEXT_PUBLIC_NEWS_API_KEY,
          },
        });
        const articles = response.data.articles.map((article: any) => ({
          url: article.url,
          title: article.title,
          description: article.description,
        }));
        setNewsArticles(articles.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch news:', error);
      }
    };

    fetchNews();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* 동적 배경 */}
      <div 
        className="fixed inset-0 transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${backgroundImages[currentBg]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <Navigation />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 animate-fade-in">
              나만의 공간
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-12 animate-fade-in-delay">
              일정 관리와 생각을 나누는 공간
            </p>
            
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto animate-fade-in-delay-2">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="검색어를 입력하세요..."
                  className="w-full px-6 py-4 text-lg rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-300 transform group-hover:scale-105"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-sky-400 to-blue-500 text-white px-6 py-2 rounded-full hover:from-sky-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <FaSearch />
                </button>
              </div>
            </form>

            {session && (
              <div className="mt-16 space-y-8 animate-fade-in-delay-3">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">달력</h2>
                  <p className="text-gray-600 mb-4">일정을 체계적으로 관리하고 효율적으로 시간을 활용하세요</p>
                  <button
                    onClick={() => router.push('/todo')}
                    className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-6 py-2 rounded-full hover:from-sky-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    달력 보기
                  </button>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">게시판</h2>
                  <p className="text-gray-600 mb-4">다양한 주제로 의견을 나누고 소통하세요</p>
                  <button
                    onClick={() => router.push('/board')}
                    className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-6 py-2 rounded-full hover:from-sky-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    게시판 가기
                  </button>
                </div>
              </div>
            )}

            {/* 뉴스와 트렌드 섹션 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
              {/* 뉴스 섹션 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaNewspaper className="text-blue-500" />
                  오늘의 주요 뉴스
                </h2>
                <div className="space-y-4">
                  {newsArticles.map((article, index) => (
                    <a
                      key={index}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <h3 className="font-medium text-gray-900">{article.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{article.description}</p>
                    </a>
                  ))}
                </div>
              </div>

              {/* 트렌드 섹션 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaChartLine className="text-blue-500" />
                  실시간 인기 검색어
                </h2>
                <div className="space-y-2">
                  {/* 임시 데이터 - 실제로는 API에서 가져와야 함 */}
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                      <span className="font-bold text-blue-500">{num}</span>
                      <span>인기 검색어 {num}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 