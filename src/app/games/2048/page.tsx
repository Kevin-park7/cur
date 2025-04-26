'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';

const BOARD_SIZE = 4;
const INITIAL_TILES = 2;

export default function Game2048() {
  const [board, setBoard] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const initializeBoard = useCallback(() => {
    const newBoard = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(0));
    
    // Add initial tiles
    for (let i = 0; i < INITIAL_TILES; i++) {
      addRandomTile(newBoard);
    }
    
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
  }, []);

  const addRandomTile = (currentBoard: number[][]) => {
    const emptyCells = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (currentBoard[i][j] === 0) {
          emptyCells.push({ x: i, y: j });
        }
      }
    }

    if (emptyCells.length > 0) {
      const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentBoard[x][y] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const moveLeft = useCallback(() => {
    const newBoard = board.map(row => {
      const filteredRow = row.filter(cell => cell !== 0);
      const mergedRow = [];
      
      for (let i = 0; i < filteredRow.length; i++) {
        if (i < filteredRow.length - 1 && filteredRow[i] === filteredRow[i + 1]) {
          mergedRow.push(filteredRow[i] * 2);
          setScore(prev => prev + filteredRow[i] * 2);
          i++;
        } else {
          mergedRow.push(filteredRow[i]);
        }
      }
      
      while (mergedRow.length < BOARD_SIZE) {
        mergedRow.push(0);
      }
      
      return mergedRow;
    });

    if (JSON.stringify(newBoard) !== JSON.stringify(board)) {
      addRandomTile(newBoard);
      setBoard(newBoard);
    }
  }, [board]);

  const moveRight = useCallback(() => {
    const newBoard = board.map(row => {
      const filteredRow = row.filter(cell => cell !== 0);
      const mergedRow = [];
      
      for (let i = filteredRow.length - 1; i >= 0; i--) {
        if (i > 0 && filteredRow[i] === filteredRow[i - 1]) {
          mergedRow.unshift(filteredRow[i] * 2);
          setScore(prev => prev + filteredRow[i] * 2);
          i--;
        } else {
          mergedRow.unshift(filteredRow[i]);
        }
      }
      
      while (mergedRow.length < BOARD_SIZE) {
        mergedRow.unshift(0);
      }
      
      return mergedRow;
    });

    if (JSON.stringify(newBoard) !== JSON.stringify(board)) {
      addRandomTile(newBoard);
      setBoard(newBoard);
    }
  }, [board]);

  const moveUp = useCallback(() => {
    const newBoard = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(0));

    for (let col = 0; col < BOARD_SIZE; col++) {
      const column = board.map(row => row[col]).filter(cell => cell !== 0);
      const mergedColumn = [];
      
      for (let i = 0; i < column.length; i++) {
        if (i < column.length - 1 && column[i] === column[i + 1]) {
          mergedColumn.push(column[i] * 2);
          setScore(prev => prev + column[i] * 2);
          i++;
        } else {
          mergedColumn.push(column[i]);
        }
      }
      
      while (mergedColumn.length < BOARD_SIZE) {
        mergedColumn.push(0);
      }
      
      for (let row = 0; row < BOARD_SIZE; row++) {
        newBoard[row][col] = mergedColumn[row];
      }
    }

    if (JSON.stringify(newBoard) !== JSON.stringify(board)) {
      addRandomTile(newBoard);
      setBoard(newBoard);
    }
  }, [board]);

  const moveDown = useCallback(() => {
    const newBoard = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(0));

    for (let col = 0; col < BOARD_SIZE; col++) {
      const column = board.map(row => row[col]).filter(cell => cell !== 0);
      const mergedColumn = [];
      
      for (let i = column.length - 1; i >= 0; i--) {
        if (i > 0 && column[i] === column[i - 1]) {
          mergedColumn.unshift(column[i] * 2);
          setScore(prev => prev + column[i] * 2);
          i--;
        } else {
          mergedColumn.unshift(column[i]);
        }
      }
      
      while (mergedColumn.length < BOARD_SIZE) {
        mergedColumn.unshift(0);
      }
      
      for (let row = 0; row < BOARD_SIZE; row++) {
        newBoard[row][col] = mergedColumn[row];
      }
    }

    if (JSON.stringify(newBoard) !== JSON.stringify(board)) {
      addRandomTile(newBoard);
      setBoard(newBoard);
    }
  }, [board]);

  const checkGameOver = useCallback(() => {
    // Check for empty cells
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] === 0) return false;
      }
    }

    // Check for possible merges
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (
          (i < BOARD_SIZE - 1 && board[i][j] === board[i + 1][j]) ||
          (j < BOARD_SIZE - 1 && board[i][j] === board[i][j + 1])
        ) {
          return false;
        }
      }
    }

    setGameOver(true);
    return true;
  }, [board]);

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          moveLeft();
          break;
        case 'ArrowRight':
          moveRight();
          break;
        case 'ArrowUp':
          moveUp();
          break;
        case 'ArrowDown':
          moveDown();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveLeft, moveRight, moveUp, moveDown, gameOver]);

  useEffect(() => {
    checkGameOver();
  }, [board, checkGameOver]);

  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      2: 'bg-yellow-100',
      4: 'bg-yellow-200',
      8: 'bg-orange-200',
      16: 'bg-orange-300',
      32: 'bg-red-300',
      64: 'bg-red-400',
      128: 'bg-yellow-300',
      256: 'bg-yellow-400',
      512: 'bg-yellow-500',
      1024: 'bg-yellow-600',
      2048: 'bg-yellow-700',
    };
    return colors[value] || 'bg-gray-200';
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">2048</h1>
              <div className="text-xl">점수: {score}</div>
            </div>

            {gameOver ? (
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold text-red-600 mb-4">게임 오버!</h2>
                <button
                  onClick={initializeBoard}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                  다시 시작
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {board.map((row, i) =>
                  row.map((cell, j) => (
                    <div
                      key={`${i}-${j}`}
                      className={`w-20 h-20 flex items-center justify-center text-2xl font-bold rounded ${
                        cell ? getTileColor(cell) : 'bg-gray-100'
                      }`}
                    >
                      {cell || ''}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 