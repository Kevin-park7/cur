'use client';

import GameMenu from '@/components/GameMenu';
import Navigation from '@/components/Navigation';

export default function GamesPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GameMenu />
        </div>
      </div>
    </>
  );
} 