'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';

const CARD_PAIRS = 8;
const CARD_EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

export default function MemoryCard() {
  const [cards, setCards] = useState<{ id: number; emoji: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const initializeCards = useCallback(() => {
    const cardPairs = [...CARD_EMOJIS, ...CARD_EMOJIS]
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);
    
    setCards(cardPairs);
    setFlippedCards([]);
    setMoves(0);
    setGameComplete(false);
  }, []);

  const handleCardClick = (cardId: number) => {
    if (
      gameComplete ||
      flippedCards.length >= 2 ||
      flippedCards.includes(cardId) ||
      cards[cardId].isMatched
    ) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      const [firstCard, secondCard] = newFlippedCards;
      
      if (cards[firstCard].emoji === cards[secondCard].emoji) {
        setCards(prev =>
          prev.map(card =>
            card.id === firstCard || card.id === secondCard
              ? { ...card, isMatched: true }
              : card
          )
        );
        setFlippedCards([]);
        
        // Check if all cards are matched
        const allMatched = cards.every(
          card => card.id === firstCard || card.id === secondCard || card.isMatched
        );
        if (allMatched) {
          setGameComplete(true);
        }
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    initializeCards();
  }, [initializeCards]);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">메모리 카드</h1>
              <div className="text-xl">이동 횟수: {moves}</div>
            </div>

            {gameComplete ? (
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold text-green-600 mb-4">게임 완료!</h2>
                <button
                  onClick={initializeCards}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                  다시 시작
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {cards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`w-24 h-24 flex items-center justify-center text-4xl font-bold rounded transition-transform duration-300 ${
                      card.isMatched
                        ? 'bg-green-100'
                        : flippedCards.includes(card.id)
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                    }`}
                    style={{
                      transform: card.isFlipped || flippedCards.includes(card.id)
                        ? 'rotateY(180deg)'
                        : 'rotateY(0deg)',
                    }}
                  >
                    {card.isFlipped || flippedCards.includes(card.id) ? card.emoji : '?'}
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