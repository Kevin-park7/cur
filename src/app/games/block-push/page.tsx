'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';

const BOARD_SIZE = 8;
const CELL_TYPES = {
  EMPTY: 0,
  WALL: 1,
  BOX: 2,
  TARGET: 3,
  PLAYER: 4,
};

const LEVELS = [
  {
    board: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 2, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    player: { x: 3, y: 3 },
    targets: [{ x: 5, y: 5 }],
  },
  {
    board: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 2, 0, 2, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 2, 0, 2, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    player: { x: 3, y: 3 },
    targets: [
      { x: 2, y: 2 },
      { x: 4, y: 2 },
      { x: 2, y: 4 },
      { x: 4, y: 4 },
    ],
  },
];

export default function BlockPush() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [board, setBoard] = useState<number[][]>([]);
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [targets, setTargets] = useState<{ x: number; y: number }[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const initializeLevel = useCallback((levelIndex: number) => {
    const level = LEVELS[levelIndex];
    setBoard(level.board);
    setPlayer(level.player);
    setTargets(level.targets);
    setMoves(0);
    setGameComplete(false);
  }, []);

  useEffect(() => {
    initializeLevel(currentLevel);
  }, [currentLevel, initializeLevel]);

  const checkGameComplete = useCallback(() => {
    const isComplete = targets.every(target => {
      const cell = board[target.y][target.x];
      return cell === CELL_TYPES.BOX;
    });
    if (isComplete) {
      setGameComplete(true);
    }
  }, [board, targets]);

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      const newX = player.x + dx;
      const newY = player.y + dy;

      if (board[newY][newX] === CELL_TYPES.WALL) return;

      if (board[newY][newX] === CELL_TYPES.BOX) {
        const boxNewX = newX + dx;
        const boxNewY = newY + dy;

        if (
          board[boxNewY][boxNewX] === CELL_TYPES.WALL ||
          board[boxNewY][boxNewX] === CELL_TYPES.BOX
        )
          return;

        const newBoard = [...board];
        newBoard[boxNewY][boxNewX] = CELL_TYPES.BOX;
        newBoard[newY][newX] = CELL_TYPES.PLAYER;
        newBoard[player.y][player.x] = CELL_TYPES.EMPTY;
        setBoard(newBoard);
        setPlayer({ x: newX, y: newY });
        setMoves(prev => prev + 1);
        checkGameComplete();
      } else {
        const newBoard = [...board];
        newBoard[newY][newX] = CELL_TYPES.PLAYER;
        newBoard[player.y][player.x] = CELL_TYPES.EMPTY;
        setBoard(newBoard);
        setPlayer({ x: newX, y: newY });
        setMoves(prev => prev + 1);
      }
    },
    [board, player, checkGameComplete]
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameComplete) return;

      switch (e.key) {
        case 'ArrowLeft':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
          movePlayer(1, 0);
          break;
        case 'ArrowUp':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
          movePlayer(0, 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer, gameComplete]);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">블록 밀기</h1>
              <div className="text-xl">이동 횟수: {moves}</div>
            </div>

            {gameComplete ? (
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold text-green-600 mb-4">레벨 클리어!</h2>
                <button
                  onClick={() => {
                    if (currentLevel < LEVELS.length - 1) {
                      setCurrentLevel(prev => prev + 1);
                    } else {
                      setCurrentLevel(0);
                    }
                  }}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                  {currentLevel < LEVELS.length - 1 ? '다음 레벨' : '처음으로'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-8 gap-1">
                {board.map((row, y) =>
                  row.map((cell, x) => {
                    const isTarget = targets.some(
                      target => target.x === x && target.y === y
                    );
                    const isPlayer = player.x === x && player.y === y;

                    let cellClass = 'w-12 h-12 border ';
                    if (isPlayer) {
                      cellClass += 'bg-blue-500';
                    } else if (cell === CELL_TYPES.WALL) {
                      cellClass += 'bg-gray-800';
                    } else if (cell === CELL_TYPES.BOX) {
                      cellClass += isTarget ? 'bg-green-500' : 'bg-yellow-500';
                    } else if (isTarget) {
                      cellClass += 'bg-red-200';
                    } else {
                      cellClass += 'bg-gray-100';
                    }

                    return <div key={`${y}-${x}`} className={cellClass} />;
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