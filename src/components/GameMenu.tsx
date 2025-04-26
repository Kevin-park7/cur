import { useState } from 'react';
import Link from 'next/link';

const games = [
  { id: 1, name: '테트리스', path: '/games/tetris' },
  { id: 2, name: '블록 밀기', path: '/games/block-push' },
  { id: 3, name: '2048', path: '/games/2048' },
  { id: 4, name: '슬라이딩 퍼즐', path: '/games/sliding-puzzle' },
  { id: 5, name: '스도쿠', path: '/games/sudoku' },
  { id: 6, name: '워드 서치', path: '/games/word-search' },
  { id: 7, name: '크로스워드', path: '/games/crossword' },
  { id: 8, name: '메모리 카드', path: '/games/memory-card' },
  { id: 9, name: '퀴즈', path: '/games/quiz' },
  { id: 10, name: '퍼즐 매칭', path: '/games/puzzle-matching' }
];

export default function GameMenu() {
  const [selectedGame, setSelectedGame] = useState<number | null>(null);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">게임 메뉴</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => setSelectedGame(game.id)}
          >
            <h3 className="font-semibold">{game.name}</h3>
          </div>
        ))}
      </div>

      {selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">{games[selectedGame - 1].name}</h3>
            <p className="mb-4">게임을 시작하시겠습니까?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setSelectedGame(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                취소
              </button>
              <Link
                href={games[selectedGame - 1].path}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                시작하기
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 