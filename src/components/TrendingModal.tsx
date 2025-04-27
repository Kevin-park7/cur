import React, { useState } from 'react';

interface TrendingModalProps {
  show: boolean;
  onClose: () => void;
  topics: string[];
}

const TrendingModal: React.FC<TrendingModalProps> = ({ show, onClose, topics }) => {
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
          <h2 className="text-2xl font-bold">실시간 인기 검색어 전체보기</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <ul className="space-y-2">
          {topics.map((topic, idx) => (
            <li key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
              <span className="font-bold text-blue-500">{idx + 1}</span>
              <span>{topic}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TrendingModal; 