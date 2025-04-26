'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';

const PUZZLE_SIZE = 4;
const PUZZLE_IMAGES = [
  '🎮', '🎲', '🎯', '🎨',
  '🎭', '🎪', '🎫', '🎬',
  '🎵', '🎶', '🎸', '🎹',
  '🎺', '🎻', '🎼', '🎤',
];

export default function PuzzleMatching() {
  const [puzzle, setPuzzle] = useState<string[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [matchedTiles, setMatchedTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const initializePuzzle = useCallback(() => {
    const shuffledImages = [...PUZZLE_IMAGES]
      .sort(() => Math.random() - 0.5)
      .slice(0, PUZZLE_SIZE * PUZZLE_SIZE / 2);
    
    const puzzlePairs = [...shuffledImages, ...shuffledImages]
      .sort(() => Math.random() - 0.5);
    
    setPuzzle(puzzlePairs);
    setSelectedTiles([]);
    setMatchedTiles([]);
    setMoves(0);
    setGameComplete(false);
  }, []);

  const handleTileClick = (index: number) => {
    if (
      gameComplete ||
      selectedTiles.length >= 2 ||
      selectedTiles.includes(index) ||
      matchedTiles.includes(index)
    ) {
      return;
    }

    const newSelectedTiles = [...selectedTiles, index];
    setSelectedTiles(newSelectedTiles);

    if (newSelectedTiles.length === 2) {
      setMoves(prev => prev + 1);
      const [firstTile, secondTile] = newSelectedTiles;
      
      if (puzzle[firstTile] === puzzle[secondTile]) {
        setMatchedTiles(prev => [...prev, firstTile, secondTile]);
        setSelectedTiles([]);
        
        // Check if all tiles are matched
        if (matchedTiles.length + 2 === puzzle.length) {
          setGameComplete(true);
        }
      } else {
        setTimeout(() => {
          setSelectedTiles([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    initializePuzzle();
  }, [initializePuzzle]);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">퍼즐 매칭</h1>
              <div className="text-xl">이동 횟수: {moves}</div>
            </div>

            {gameComplete ? (
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold text-green-600 mb-4">게임 완료!</h2>
                <button
                  onClick={initializePuzzle}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                  다시 시작
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {puzzle.map((tile, index) => (
                  <button
                    key={index}
                    onClick={() => handleTileClick(index)}
                    className={`w-24 h-24 flex items-center justify-center text-4xl font-bold rounded transition-transform duration-300 ${
                      matchedTiles.includes(index)
                        ? 'bg-green-100'
                        : selectedTiles.includes(index)
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                    }`}
                    style={{
                      transform: selectedTiles.includes(index) || matchedTiles.includes(index)
                        ? 'rotateY(180deg)'
                        : 'rotateY(0deg)',
                    }}
                  >
                    {selectedTiles.includes(index) || matchedTiles.includes(index)
                      ? tile
                      : '?'}
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