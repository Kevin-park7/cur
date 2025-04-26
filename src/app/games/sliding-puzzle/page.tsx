'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';

const BOARD_SIZE = 3;
const TOTAL_TILES = BOARD_SIZE * BOARD_SIZE;

export default function SlidingPuzzle() {
  const [board, setBoard] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const initializeBoard = useCallback(() => {
    const numbers = Array.from({ length: TOTAL_TILES - 1 }, (_, i) => i + 1);
    numbers.push(0); // Empty tile
    
    // Shuffle the numbers
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    
    setBoard(numbers);
    setMoves(0);
    setGameComplete(false);
  }, []);

  const isSolvable = (numbers: number[]) => {
    let inversions = 0;
    const size = Math.sqrt(numbers.length);
    
    for (let i = 0; i < numbers.length - 1; i++) {
      for (let j = i + 1; j < numbers.length; j++) {
        if (numbers[i] !== 0 && numbers[j] !== 0 && numbers[i] > numbers[j]) {
          inversions++;
        }
      }
    }
    
    const emptyRow = Math.floor(numbers.indexOf(0) / size);
    return (size % 2 === 1) ? (inversions % 2 === 0) : ((inversions + emptyRow) % 2 === 0);
  };

  const checkGameComplete = useCallback(() => {
    const isComplete = board.every((tile, index) => {
      if (index === board.length - 1) return tile === 0;
      return tile === index + 1;
    });
    
    if (isComplete) {
      setGameComplete(true);
    }
  }, [board]);

  const moveTile = useCallback((index: number) => {
    const emptyIndex = board.indexOf(0);
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;
    const emptyRow = Math.floor(emptyIndex / BOARD_SIZE);
    const emptyCol = emptyIndex % BOARD_SIZE;

    // Check if the clicked tile is adjacent to the empty tile
    if (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    ) {
      const newBoard = [...board];
      [newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]];
      setBoard(newBoard);
      setMoves(prev => prev + 1);
      checkGameComplete();
    }
  }, [board, checkGameComplete]);

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  const getTileColor = (value: number) => {
    if (value === 0) return 'bg-gray-100';
    const colors = [
      'bg-blue-100',
      'bg-blue-200',
      'bg-blue-300',
      'bg-blue-400',
      'bg-blue-500',
      'bg-blue-600',
      'bg-blue-700',
      'bg-blue-800',
    ];
    return colors[(value - 1) % colors.length];
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">슬라이딩 퍼즐</h1>
              <div className="text-xl">이동 횟수: {moves}</div>
            </div>

            {gameComplete ? (
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold text-green-600 mb-4">퍼즐 완성!</h2>
                <button
                  onClick={initializeBoard}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                  다시 시작
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {board.map((tile, index) => (
                  <button
                    key={index}
                    onClick={() => moveTile(index)}
                    className={`w-20 h-20 flex items-center justify-center text-2xl font-bold rounded ${
                      tile ? getTileColor(tile) : 'bg-gray-100'
                    }`}
                  >
                    {tile || ''}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 