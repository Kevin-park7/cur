'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';

const QUIZ_QUESTIONS = [
  {
    question: 'JavaScript의 기본 데이터 타입이 아닌 것은?',
    options: ['String', 'Number', 'Boolean', 'Array'],
    correctAnswer: 'Array',
  },
  {
    question: 'React에서 상태를 관리하는 Hook은?',
    options: ['useState', 'useEffect', 'useContext', 'useReducer'],
    correctAnswer: 'useState',
  },
  {
    question: 'HTML5의 새로운 시맨틱 태그가 아닌 것은?',
    options: ['<header>', '<footer>', '<div>', '<nav>'],
    correctAnswer: '<div>',
  },
  {
    question: 'CSS에서 요소를 숨기는 속성은?',
    options: ['display: none', 'visibility: hidden', 'opacity: 0', 'position: absolute'],
    correctAnswer: 'display: none',
  },
  {
    question: 'Node.js의 특징이 아닌 것은?',
    options: ['비동기 I/O', '이벤트 기반', '싱글 스레드', '멀티 스레드'],
    correctAnswer: '멀티 스레드',
  },
  {
    question: 'TypeScript의 특징이 아닌 것은?',
    options: ['정적 타입', '컴파일 타임 체크', '런타임 체크', '인터페이스'],
    correctAnswer: '런타임 체크',
  },
  {
    question: 'Git의 기본 명령어가 아닌 것은?',
    options: ['commit', 'push', 'pull', 'build'],
    correctAnswer: 'build',
  },
  {
    question: 'HTTP 메서드가 아닌 것은?',
    options: ['GET', 'POST', 'PUT', 'SEND'],
    correctAnswer: 'SEND',
  },
  {
    question: '데이터베이스에서 JOIN의 종류가 아닌 것은?',
    options: ['INNER JOIN', 'OUTER JOIN', 'CROSS JOIN', 'VERTICAL JOIN'],
    correctAnswer: 'VERTICAL JOIN',
  },
  {
    question: '웹 보안 취약점이 아닌 것은?',
    options: ['XSS', 'CSRF', 'SQL Injection', 'HTML Injection'],
    correctAnswer: 'HTML Injection',
  },
];

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswer = (selectedAnswer: string) => {
    if (isAnswered) return;

    setIsAnswered(true);
    if (selectedAnswer === QUIZ_QUESTIONS[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestion + 1 < QUIZ_QUESTIONS.length) {
        setCurrentQuestion(prev => prev + 1);
        setTimeLeft(30);
        setIsAnswered(false);
      } else {
        setShowScore(true);
      }
    }, 1000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setTimeLeft(30);
    setIsAnswered(false);
  };

  useEffect(() => {
    if (!showScore && !isAnswered) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (currentQuestion + 1 < QUIZ_QUESTIONS.length) {
              setCurrentQuestion(prev => prev + 1);
              setIsAnswered(false);
              return 30;
            } else {
              setShowScore(true);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuestion, showScore, isAnswered]);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">퀴즈</h1>
              <div className="text-xl">남은 시간: {timeLeft}초</div>
            </div>

            {showScore ? (
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold text-blue-600 mb-4">
                  퀴즈 완료!
                </h2>
                <p className="text-xl mb-4">
                  점수: {score} / {QUIZ_QUESTIONS.length}
                </p>
                <button
                  onClick={resetQuiz}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                  다시 시작
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-2">
                    문제 {currentQuestion + 1} / {QUIZ_QUESTIONS.length}
                  </h2>
                  <p className="text-lg">{QUIZ_QUESTIONS[currentQuestion].question}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {QUIZ_QUESTIONS[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      className={`p-4 text-left rounded-lg transition-colors ${
                        isAnswered
                          ? option === QUIZ_QUESTIONS[currentQuestion].correctAnswer
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      disabled={isAnswered}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 