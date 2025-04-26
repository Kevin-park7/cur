'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';

const BOARD_SIZE = 15;
const WORDS = [
  { word: 'JAVASCRIPT', clue: '웹 브라우저에서 실행되는 프로그래밍 언어' },
  { word: 'TYPESCRIPT', clue: 'JavaScript의 상위 집합 언어' },
  { word: 'REACT', clue: 'Facebook에서 만든 UI 라이브러리' },
  { word: 'NODEJS', clue: 'JavaScript 런타임 환경' },
  { word: 'HTML', clue: '웹 페이지의 구조를 정의하는 마크업 언어' },
  { word: 'CSS', clue: '웹 페이지의 스타일을 정의하는 언어' },
  { word: 'PYTHON', clue: '간단하고 배우기 쉬운 프로그래밍 언어' },
  { word: 'JAVA', clue: '객체 지향 프로그래밍 언어' },
  { word: 'RUBY', clue: '일본에서 개발된 프로그래밍 언어' },
  { word: 'PHP', clue: '서버 사이드 스크립팅 언어' },
];

export default function Crossword() {
  const [board, setBoard] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedWord, setSelectedWord] = useState<{ word: string; clue: string } | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [gameComplete, setGameComplete] = useState(false);

  const generateBoard = useCallback(() => {
    const newBoard = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(''));
    
    // Place words
    WORDS.forEach(({ word }) => {
      let placed = false;
      while (!placed) {
        const isHorizontal = Math.random() < 0.5;
        const startRow = Math.floor(Math.random() * BOARD_SIZE);
        const startCol = Math.floor(Math.random() * BOARD_SIZE);
        
        if (canPlaceWord(newBoard, word, startRow, startCol, isHorizontal)) {
          placeWord(newBoard, word, startRow, startCol, isHorizontal);
          placed = true;
        }
      }
    });
    
    setBoard(newBoard);
    setSelectedCell(null);
    setSelectedWord(null);
    setFoundWords([]);
    setGameComplete(false);
  }, []);

  const canPlaceWord = (
    board: string[][],
    word: string,
    startRow: number,
    startCol: number,
    isHorizontal: boolean
  ) => {
    for (let i = 0; i < word.length; i++) {
      const row = isHorizontal ? startRow : startRow + i;
      const col = isHorizontal ? startCol + i : startCol;
      
      if (
        row < 0 ||
        row >= BOARD_SIZE ||
        col < 0 ||
        col >= BOARD_SIZE ||
        (board[row][col] !== '' && board[row][col] !== word[i])
      ) {
        return false;
      }
    }
    
    return true;
  };

  const placeWord = (
    board: string[][],
    word: string,
    startRow: number,
    startCol: number,
    isHorizontal: boolean
  ) => {
    for (let i = 0; i < word.length; i++) {
      const row = isHorizontal ? startRow : startRow + i;
      const col = isHorizontal ? startCol + i : startCol;
      board[row][col] = word[i];
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (gameComplete) return;

    setSelectedCell({ row, col });
    
    // Find the word that contains this cell
    const word = WORDS.find(({ word }) => {
      for (let i = 0; i < word.length; i++) {
        if (board[row][col] === word[i]) {
          return true;
        }
      }
      return false;
    });
    
    if (word) {
      setSelectedWord(word);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!selectedCell || gameComplete) return;

    const { row, col } = selectedCell;
    const newBoard = [...board];
    newBoard[row][col] = e.key.toUpperCase();
    setBoard(newBoard);

    // Check if the word is complete
    const word = WORDS.find(({ word }) => {
      for (let i = 0; i < word.length; i++) {
        if (board[row][col] === word[i]) {
          return true;
        }
      }
      return false;
    });

    if (word && !foundWords.includes(word.word)) {
      setFoundWords(prev => [...prev, word.word]);
      
      if (foundWords.length + 1 === WORDS.length) {
        setGameComplete(true);
      }
    }
  };

  useEffect(() => {
    generateBoard();
  }, [generateBoard]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedCell, board, foundWords, gameComplete]);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">크로스워드</h1>
              <button
                onClick={generateBoard}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                새 게임
              </button>
            </div>

            {gameComplete ? (
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold text-green-600 mb-4">퍼즐 완성!</h2>
                <button
                  onClick={generateBoard}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                  새 게임 시작
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-8">
                <div className="grid grid-cols-15 gap-1">
                  {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const isSelected =
                        selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                      return (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : cell
                              ? 'bg-gray-100'
                              : 'bg-gray-200'
                          }`}
                        >
                          {cell}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="w-64">
                  <h3 className="text-lg font-bold mb-2">단어 목록:</h3>
                  <div className="space-y-2">
                    {WORDS.map(({ word, clue }) => (
                      <div
                        key={word}
                        className={`p-2 rounded ${
                          foundWords.includes(word)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100'
                        }`}
                      >
                        <div className="font-bold">{word}</div>
                        <div className="text-sm text-gray-600">{clue}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 