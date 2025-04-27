import React, { useState } from 'react';

interface News {
  id: string;
  title: string;
  content: string;
  url: string;
  imageUrl?: string | null;
  source: string;
  publishedAt: string;
}

interface NewsModalProps {
  show: boolean;
  onClose: () => void;
  newsList: News[];
}

const NewsModal: React.FC<NewsModalProps> = ({ show, onClose, newsList }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  if (!show) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 relative"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">오늘의 주요 뉴스 전체보기</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <ul className="space-y-4">
          {newsList.map((article, idx) => (
            <li key={article.id || idx} className="border-b pb-2">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <h3 className="font-medium text-gray-900">{idx + 1}. {article.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{article.content}</p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NewsModal; 