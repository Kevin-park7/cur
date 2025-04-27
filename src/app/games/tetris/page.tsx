'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
const COLORS = [
  'bg-cyan-400', // I
  'bg-yellow-300', // O
  'bg-purple-500', // T
  'bg-orange-400', // L
  'bg-blue-500', // J
  'bg-green-400', // S
  'bg-red-500', // Z
];

function getRandomPiece() {
  const type = Math.floor(Math.random() * SHAPES.length);
  return { shape: SHAPES[type], type };
}

export default function Tetris() {
  const [board, setBoard] = useState<number[][]>([]);
  const [currentPiece, setCurrentPiece] = useState<{ shape: number[][]; x: number; y: number; type: number } | null>(null);
  const [nextPieces, setNextPieces] = useState<{ shape: number[][]; type: number }[]>([getRandomPiece(), getRandomPiece(), getRandomPiece()]);
  const [holdPiece, setHoldPiece] = useState<{ shape: number[][]; type: number } | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [holdCount, setHoldCount] = useState(3);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [impactRows, setImpactRows] = useState<number[]>([]);
  const hardDropInProgress = useRef(false);

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
      type: Math.floor(Math.random() * SHAPES.length),
    });
  }, []);

  const moveDown = useCallback(() => {
    if (!currentPiece || paused || gameOver) return;
    const newY = currentPiece.y + 1;
    if (isValidMove(currentPiece.shape, currentPiece.x, newY)) {
      setCurrentPiece({ ...currentPiece, y: newY });
    } else {
      placePiece();
    }
  }, [currentPiece, paused, gameOver]);

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

  const placePieceWith = (piece: { shape: number[][]; x: number; y: number; type: number } | null) => {
    if (!piece) return;
    const newBoard = board.map(row => [...row]);
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const y = piece.y + row;
          const x = piece.x + col;
          if (y >= 0) {
            newBoard[y][x] = piece.type + 1;
          }
        }
      }
    }
    let linesCleared = 0;
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (newBoard[row].every(cell => cell > 0)) {
        newBoard.splice(row, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
        linesCleared++;
        row++;
      }
    }
    setScore(prev => prev + linesCleared * 100);
    setLines(prev => prev + linesCleared);
    if ((lines + linesCleared) >= level * 10) {
      setLevel(prev => prev + 1);
      setHoldCount(c => c + 1);
    }
    setBoard(newBoard);
    const [next, ...rest] = nextPieces.length ? nextPieces : [getRandomPiece(), getRandomPiece(), getRandomPiece()];
    setCurrentPiece({ ...next, x: Math.floor((BOARD_WIDTH - next.shape[0].length) / 2), y: 0 });
    setNextPieces([...rest, getRandomPiece()]);
    setCanHold(true);
    if (!isValidMove(next.shape, Math.floor((BOARD_WIDTH - next.shape[0].length) / 2), 0)) {
      setGameOver(true);
    }
  };

  const placePiece = useCallback(() => {
    if (!currentPiece) return;
    const newBoard = board.map(row => [...row]);
    for (let row = 0; row < currentPiece.shape.length; row++) {
      for (let col = 0; col < currentPiece.shape[row].length; col++) {
        if (currentPiece.shape[row][col]) {
          const y = currentPiece.y + row;
          const x = currentPiece.x + col;
          if (y >= 0) {
            newBoard[y][x] = currentPiece.type + 1;
          }
        }
      }
    }
    let linesCleared = 0;
    const impact: number[] = [];
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (newBoard[row].every(cell => cell > 0)) {
        newBoard.splice(row, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
        linesCleared++;
        row++;
      }
    }
    setScore(prev => prev + linesCleared * 100);
    setLines(prev => prev + linesCleared);
    if ((lines + linesCleared) >= level * 10) {
      setLevel(prev => prev + 1);
      setHoldCount(c => c + 1);
    }
    setBoard(newBoard);
    const [next, ...rest] = nextPieces.length ? nextPieces : [getRandomPiece(), getRandomPiece(), getRandomPiece()];
    setCurrentPiece({ ...next, x: Math.floor((BOARD_WIDTH - next.shape[0].length) / 2), y: 0 });
    setNextPieces([...rest, getRandomPiece()]);
    setCanHold(true);
    if (!isValidMove(next.shape, Math.floor((BOARD_WIDTH - next.shape[0].length) / 2), 0)) {
      setGameOver(true);
    }
  }, [currentPiece, board, nextPieces, lines, level]);

  const handleHold = () => {
    if (!currentPiece || holdCount <= 0) return;
    if (!holdPiece) {
      setHoldPiece({ shape: currentPiece.shape, type: currentPiece.type });
      const [next, ...rest] = nextPieces;
      setCurrentPiece({ ...next, x: Math.floor((BOARD_WIDTH - next.shape[0].length) / 2), y: 0 });
      setNextPieces([...rest, getRandomPiece()]);
    } else {
      const temp = holdPiece;
      setHoldPiece({ shape: currentPiece.shape, type: currentPiece.type });
      setCurrentPiece({ ...temp, x: Math.floor((BOARD_WIDTH - temp.shape[0].length) / 2), y: 0 });
    }
    setHoldCount(c => c - 1);
  };

  const handlePause = () => setPaused(p => !p);

  const hardDrop = () => {
    if (!currentPiece || paused || gameOver || hardDropInProgress.current) return;
    hardDropInProgress.current = true;
    let dropY = currentPiece.y;
    while (isValidMove(currentPiece.shape, currentPiece.x, dropY + 1)) {
      dropY++;
    }
    setCurrentPiece(piece => {
      if (!piece) return piece;
      const newPiece = { ...piece, y: dropY };
      setTimeout(() => {
        if (!paused && !gameOver) placePieceWith(newPiece);
        hardDropInProgress.current = false;
      }, 0);
      return newPiece;
    });
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    initializeBoard();
    generateNewPiece();
  }, [initializeBoard, generateNewPiece]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver || paused) return;
      switch (e.key) {
        case 'ArrowLeft': moveLeft(); break;
        case 'ArrowRight': moveRight(); break;
        case 'ArrowDown': moveDown(); break;
        case 'ArrowUp': rotate(); break;
        default:
          if (e.code === 'Space') {
            e.preventDefault();
            hardDrop();
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyPress, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveLeft, moveRight, moveDown, rotate, gameOver, paused, hardDrop]);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(moveDown, 1000);
    return () => clearInterval(interval);
  }, [moveDown, gameOver]);

  useEffect(() => {
    if (gameOver || paused) return;
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameOver, paused]);

  useEffect(() => {
    if (gameOver || paused) return;
    const interval = setInterval(moveDown, Math.max(100, 1000 - (level - 1) * 100));
    return () => clearInterval(interval);
  }, [moveDown, gameOver, paused, level]);

  return (
    <>
      <Navigation />
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-200 bg-[url('/tetris-bg.png')] bg-cover bg-center">
        <div className="flex flex-row items-start justify-center gap-8 p-8 rounded-2xl shadow-2xl bg-black/20 border-8 border-[#6b4e2e]" style={{minWidth: 420}}>
          {/* 좌측: hold */}
          <div className="flex flex-col items-center gap-8">
            <div className="bg-black/60 border-4 border-[#bdbdbd] rounded-xl shadow-lg p-4 w-24">
              <div className="text-center font-bold text-white mb-2 tracking-widest uppercase">hold</div>
              <div className="flex flex-col items-center min-h-[60px]">
                {holdPiece ? holdPiece.shape.map((row, y) => (
                  <div key={y} className="flex">
                    {row.map((cell, x) => (
                      <div key={x} className={`w-5 h-5 border border-[#bdbdbd] rounded-sm ${cell ? COLORS[holdPiece.type] : 'bg-gray-800'}`}></div>
                    ))}
                  </div>
                )) : <div className="text-xs text-gray-400">없음</div>}
              </div>
            </div>
            <button
              onClick={handlePause}
              className={`w-24 py-2 rounded-lg font-bold shadow bg-gradient-to-r from-[#bdbdbd] to-[#6b4e2e] text-white border-2 border-[#6b4e2e]`}
            >
              {paused ? '재개' : '정지'}
            </button>
            <button
              onClick={handleHold}
              className="w-24 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 font-bold shadow text-white border-2 border-yellow-600 mt-2"
              disabled={holdCount <= 0}
            >
              HOLD
            </button>
            <div className="text-xs text-white mt-4">HOLD 가능 횟수: <span className="font-bold">{holdCount}</span></div>
          </div>
          {/* 중앙: 게임 보드 */}
          <div className="relative flex flex-col items-center">
            <div className="bg-black/70 border-4 border-[#bdbdbd] rounded-2xl shadow-2xl p-2 flex flex-col items-center">
              <div className="grid grid-cols-10 gap-0">
                {board.map((row, y) =>
                  row.map((cell, x) => {
                    const isCurrentPiece =
                      currentPiece &&
                      y >= currentPiece.y &&
                      y < currentPiece.y + currentPiece.shape.length &&
                      x >= currentPiece.x &&
                      x < currentPiece.x + currentPiece.shape[0].length &&
                      currentPiece.shape[y - currentPiece.y][x - currentPiece.x];
                    const type = isCurrentPiece ? currentPiece.type : (cell ? cell - 1 : null);
                    return (
                      <div
                        key={`${y}-${x}`}
                        className={`w-6 h-6 border border-[#bdbdbd] rounded-[4px] shadow-sm ${type !== null && type !== undefined ? COLORS[type] : 'bg-gray-800'}`}
                      />
                    );
                  })
                )}
              </div>
            </div>
            {/* 모바일 컨트롤러 */}
            {isMobile && (
              <div className="absolute left-1/2 -bottom-24 -translate-x-1/2 flex gap-2 mt-4">
                <button onClick={moveLeft} className="w-12 h-12 bg-gray-200 rounded-full shadow text-2xl">◀️</button>
                <button onClick={moveRight} className="w-12 h-12 bg-gray-200 rounded-full shadow text-2xl">▶️</button>
                <button onClick={moveDown} className="w-12 h-12 bg-gray-200 rounded-full shadow text-2xl">🔽</button>
                <button onClick={rotate} className="w-12 h-12 bg-gray-200 rounded-full shadow text-2xl">⟳</button>
                <button onClick={hardDrop} className="w-12 h-12 bg-blue-400 text-white rounded-full shadow text-2xl">⬇️</button>
              </div>
            )}
          </div>
          {/* 우측: next, info */}
          <div className="flex flex-col items-center gap-8">
            <div className="bg-black/60 border-4 border-[#bdbdbd] rounded-xl shadow-lg p-4 w-24">
              <div className="text-center font-bold text-white mb-2 tracking-widest uppercase">next</div>
              <div className="flex flex-col items-center gap-2 min-h-[60px]">
                {nextPieces.slice(0, 3).map((piece, idx) => (
                  <div key={idx} className="mb-2">
                    {piece.shape.map((row, y) => (
                      <div key={y} className="flex">
                        {row.map((cell, x) => (
                          <div key={x} className={`w-5 h-5 border border-[#bdbdbd] rounded-sm ${cell ? COLORS[piece.type] : 'bg-gray-800'}`}></div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-black/80 border-2 border-[#bdbdbd] rounded-xl shadow p-4 w-40 text-sm space-y-2 text-white font-mono">
              <div className="flex justify-between"><span>time</span><span className="font-bold">{Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</span></div>
              <div className="flex justify-between"><span>level</span><span className="font-bold">{level}</span></div>
              <div className="flex justify-between"><span>score</span><span className="font-bold">{score}</span></div>
              <div className="flex justify-between"><span>lines</span><span className="font-bold">{lines}</span></div>
              <div className="flex justify-between"><span>speed</span><span className="font-bold">{Math.max(1, 11 - level)}</span></div>
            </div>
          </div>
        </div>
        {/* 게임 오버 */}
        {gameOver && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h2 className="text-3xl font-bold text-red-600 mb-4">게임 오버!</h2>
              <div className="mb-4">점수: <span className="font-bold">{score}</span></div>
              <button
                onClick={() => {
                  setGameOver(false);
                  setScore(0);
                  setLines(0);
                  setLevel(1);
                  setElapsed(0);
                  initializeBoard();
                  setNextPieces([getRandomPiece(), getRandomPiece(), getRandomPiece()]);
                  setHoldPiece(null);
                  setHoldCount(3);
                  generateNewPiece();
                }}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                다시 시작
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 