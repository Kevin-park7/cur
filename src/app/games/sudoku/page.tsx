'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';

const BOARD_SIZE = 9;
const EMPTY_CELL = 0;

export default function Sudoku() {
  const [board, setBoard] = useState<number[][]>([]);
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [gameComplete, setGameComplete] = useState(false);

  const generateSudoku = useCallback(() => {
    const newBoard = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(EMPTY_CELL));
    
    // Fill diagonal boxes
    for (let box = 0; box < BOARD_SIZE; box += 3) {
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const randomIndex = Math.floor(Math.random() * numbers.length);
          newBoard[box + i][box + j] = numbers[randomIndex];
          numbers.splice(randomIndex, 1);
        }
      }
    }
    
    // Solve the rest of the board
    solveSudoku(newBoard);
    
    // Remove some numbers to create the puzzle
    const puzzle = newBoard.map(row => [...row]);
    const cellsToRemove = 40; // Adjust difficulty by changing this number
    
    for (let i = 0; i < cellsToRemove; i++) {
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);
      puzzle[row][col] = EMPTY_CELL;
    }
    
    setBoard(puzzle);
    setInitialBoard(puzzle.map(row => [...row]));
    setGameComplete(false);
  }, []);

  const isValid = (board: number[][], row: number, col: number, num: number) => {
    // Check row
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[row][x] === num) return false;
    }
    
    // Check column
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[x][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i][boxCol + j] === num) return false;
      }
    }
    
    return true;
  };

  const solveSudoku = (board: number[][]) => {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === EMPTY_CELL) {
          for (let num = 1; num <= BOARD_SIZE; num++) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (solveSudoku(board)) return true;
              board[row][col] = EMPTY_CELL;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  const handleCellClick = (row: number, col: number) => {
    if (initialBoard[row][col] === EMPTY_CELL) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberInput = (num: number) => {
    if (selectedCell && initialBoard[selectedCell.row][selectedCell.col] === EMPTY_CELL) {
      const newBoard = board.map(row => [...row]);
      newBoard[selectedCell.row][selectedCell.col] = num;
      setBoard(newBoard);
      
      // Check if the board is complete
      const isComplete = newBoard.every(row => row.every(cell => cell !== EMPTY_CELL));
      if (isComplete) {
        setGameComplete(true);
      }
    }
  };

  const checkGameComplete = useCallback(() => {
    if (!board.some(row => row.some(cell => cell === EMPTY_CELL))) {
      setGameComplete(true);
    }
  }, [board]);

  useEffect(() => {
    generateSudoku();
  }, [generateSudoku]);

  useEffect(() => {
    checkGameComplete();
  }, [board, checkGameComplete]);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">스도쿠</h1>
              <button
                onClick={generateSudoku}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                새 게임
              </button>
            </div>

            {gameComplete ? (
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold text-green-600 mb-4">퍼즐 완성!</h2>
                <button
                  onClick={generateSudoku}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                  새 게임 시작
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-9 gap-1 mb-4">
                  {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        className={`w-10 h-10 flex items-center justify-center text-lg font-bold border ${
                          selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                            ? 'bg-blue-100'
                            : initialBoard[rowIndex][colIndex] !== EMPTY_CELL
                            ? 'bg-gray-100'
                            : 'bg-white'
                        } ${
                          (rowIndex + 1) % 3 === 0 && rowIndex < BOARD_SIZE - 1
                            ? 'border-b-2'
                            : ''
                        } ${
                          (colIndex + 1) % 3 === 0 && colIndex < BOARD_SIZE - 1
                            ? 'border-r-2'
                            : ''
                        }`}
                      >
                        {cell || ''}
                      </button>
                    ))
                  )}
                </div>

                <div className="grid grid-cols-9 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                      key={num}
                      onClick={() => handleNumberInput(num)}
                      className="w-10 h-10 flex items-center justify-center text-lg font-bold bg-gray-100 rounded hover:bg-gray-200"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 