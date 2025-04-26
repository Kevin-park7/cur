'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[1, 1, 1], [0, 1, 0]], // T
  [[1, 1, 1], [1, 0, 0]], // L
  [[1, 1, 1], [0, 0, 1]], // J
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]], // Z
];

export default function Tetris() {
  const [board, setBoard] = useState<number[][]>([]);
  const [currentPiece, setCurrentPiece] = useState<{ shape: number[][]; x: number; y: number } | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const initializeBoard = useCallback(() => {
    const newBoard = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
    setBoard(newBoard);
  }, []);

  const generateNewPiece = useCallback(() => {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    setCurrentPiece({
      shape,
      x: Math.floor((BOARD_WIDTH - shape[0].length) / 2),
      y: 0,
    });
  }, []);

  const moveDown = useCallback(() => {
    if (!currentPiece) return;

    const newY = currentPiece.y + 1;
    if (isValidMove(currentPiece.shape, currentPiece.x, newY)) {
      setCurrentPiece({ ...currentPiece, y: newY });
    } else {
      placePiece();
    }
  }, [currentPiece]);

  const moveLeft = useCallback(() => {
    if (!currentPiece) return;

    const newX = currentPiece.x - 1;
    if (isValidMove(currentPiece.shape, newX, currentPiece.y)) {
      setCurrentPiece({ ...currentPiece, x: newX });
    }
  }, [currentPiece]);

  const moveRight = useCallback(() => {
    if (!currentPiece) return;

    const newX = currentPiece.x + 1;
    if (isValidMove(currentPiece.shape, newX, currentPiece.y)) {
      setCurrentPiece({ ...currentPiece, x: newX });
    }
  }, [currentPiece]);

  const rotate = useCallback(() => {
    if (!currentPiece) return;

    const rotated = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map(row => row[i]).reverse()
    );

    if (isValidMove(rotated, currentPiece.x, currentPiece.y)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
    }
  }, [currentPiece]);

  const isValidMove = (shape: number[][], x: number, y: number) => {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const placePiece = useCallback(() => {
    if (!currentPiece) return;

    const newBoard = [...board];
    for (let row = 0; row < currentPiece.shape.length; row++) {
      for (let col = 0; col < currentPiece.shape[row].length; col++) {
        if (currentPiece.shape[row][col]) {
          const y = currentPiece.y + row;
          const x = currentPiece.x + col;
          if (y >= 0) {
            newBoard[y][x] = 1;
          }
        }
      }
    }

    // Check for completed lines
    let linesCleared = 0;
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (newBoard[row].every(cell => cell === 1)) {
        newBoard.splice(row, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
        linesCleared++;
        row++;
      }
    }

    setScore(prev => prev + linesCleared * 100);
    setBoard(newBoard);
    generateNewPiece();

    // Check for game over
    if (!isValidMove(currentPiece.shape, currentPiece.x, currentPiece.y)) {
      setGameOver(true);
    }
  }, [currentPiece, board, generateNewPiece]);

  useEffect(() => {
    initializeBoard();
    generateNewPiece();
  }, [initializeBoard, generateNewPiece]);

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
        case 'ArrowDown':
          moveDown();
          break;
        case 'ArrowUp':
          rotate();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveLeft, moveRight, moveDown, rotate, gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(moveDown, 1000);
    return () => clearInterval(interval);
  }, [moveDown, gameOver]);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">테트리스</h1>
              <div className="text-xl">점수: {score}</div>
            </div>

            {gameOver ? (
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold text-red-600 mb-4">게임 오버!</h2>
                <button
                  onClick={() => {
                    setGameOver(false);
                    setScore(0);
                    initializeBoard();
                    generateNewPiece();
                  }}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                  다시 시작
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-10 gap-1">
                {board.map((row, y) =>
                  row.map((cell, x) => {
                    const isCurrentPiece =
                      currentPiece &&
                      y >= currentPiece.y &&
                      y < currentPiece.y + currentPiece.shape.length &&
                      x >= currentPiece.x &&
                      x < currentPiece.x + currentPiece.shape[0].length &&
                      currentPiece.shape[y - currentPiece.y][x - currentPiece.x];

                    return (
                      <div
                        key={`${y}-${x}`}
                        className={`w-8 h-8 border ${
                          cell || isCurrentPiece
                            ? 'bg-blue-500'
                            : 'bg-gray-100'
                        }`}
                      />
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 