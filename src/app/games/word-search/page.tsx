'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';

const BOARD_SIZE = 10;
const WORDS = [
  'JAVASCRIPT',
  'TYPESCRIPT',
  'REACT',
  'NEXTJS',
  'NODEJS',
  'HTML',
  'CSS',
  'PYTHON',
  'JAVA',
  'RUBY',
];

const DIRECTIONS = [
  { dx: 1, dy: 0 }, // horizontal
  { dx: 0, dy: 1 }, // vertical
  { dx: 1, dy: 1 }, // diagonal down-right
  { dx: 1, dy: -1 }, // diagonal up-right
];

export default function WordSearch() {
  const [board, setBoard] = useState<string[][]>([]);
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [gameComplete, setGameComplete] = useState(false);

  const generateBoard = useCallback(() => {
    const newBoard = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(''));
    
    // Fill board with random letters
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        newBoard[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
    
    // Place words
    WORDS.forEach(word => {
      let placed = false;
      while (!placed) {
        const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
        const startRow = Math.floor(Math.random() * BOARD_SIZE);
        const startCol = Math.floor(Math.random() * BOARD_SIZE);
        
        if (canPlaceWord(newBoard, word, startRow, startCol, direction)) {
          placeWord(newBoard, word, startRow, startCol, direction);
          placed = true;
        }
      }
    });
    
    setBoard(newBoard);
    setSelectedCells([]);
    setFoundWords([]);
    setGameComplete(false);
  }, []);

  const canPlaceWord = (
    board: string[][],
    word: string,
    startRow: number,
    startCol: number,
    direction: { dx: number; dy: number }
  ) => {
    const { dx, dy } = direction;
    
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dy;
      const col = startCol + i * dx;
      
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
    direction: { dx: number; dy: number }
  ) => {
    const { dx, dy } = direction;
    
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dy;
      const col = startCol + i * dx;
      board[row][col] = word[i];
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (gameComplete) return;

    const newSelectedCells = [...selectedCells];
    const cellIndex = newSelectedCells.findIndex(
      cell => cell.row === row && cell.col === col
    );

    if (cellIndex === -1) {
      newSelectedCells.push({ row, col });
    } else {
      newSelectedCells.splice(cellIndex, 1);
    }

    setSelectedCells(newSelectedCells);
    checkWord(newSelectedCells);
  };

  const checkWord = (cells: { row: number; col: number }[]) => {
    if (cells.length < 3) return;

    const word = cells
      .map(cell => board[cell.row][cell.col])
      .join('')
      .toUpperCase();

    if (WORDS.includes(word) && !foundWords.includes(word)) {
      setFoundWords(prev => [...prev, word]);
      setSelectedCells([]);

      if (foundWords.length + 1 === WORDS.length) {
        setGameComplete(true);
      }
    }
  };

  useEffect(() => {
    generateBoard();
  }, [generateBoard]);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">워드 서치</h1>
              <button
                onClick={generateBoard}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                새 게임
              </button>
            </div>

            {gameComplete ? (
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold text-green-600 mb-4">모든 단어를 찾았습니다!</h2>
                <button
                  onClick={generateBoard}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                  새 게임 시작
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-8">
                <div className="grid grid-cols-10 gap-1">
                  {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const isSelected = selectedCells.some(
                        cell => cell.row === rowIndex && cell.col === colIndex
                      );
                      return (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded ${
                            isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100'
                          }`}
                        >
                          {cell}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="w-64">
                  <h3 className="text-lg font-bold mb-2">찾은 단어:</h3>
                  <div className="space-y-2">
                    {WORDS.map(word => (
                      <div
                        key={word}
                        className={`p-2 rounded ${
                          foundWords.includes(word)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100'
                        }`}
                      >
                        {word}
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