'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent font-playfair">
                My Space
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {session && (
              <>
                <Link
                  href="/todo"
                  className="text-gray-700 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 font-poppins"
                >
                  Calendar
                </Link>
                <Link
                  href="/board"
                  className="text-gray-700 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 font-poppins"
                >
                  Board
                </Link>
              </>
            )}
            {session ? (
              <>
                <span className="text-gray-700 px-3 py-2 text-sm">
                  {session.user?.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-sky-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/auth/signin"
                  className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-sky-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl font-inter"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-white text-sky-600 border-2 border-sky-500 px-4 py-2 rounded-md text-sm font-medium hover:bg-sky-50 transition-all duration-300 font-inter"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-sky-600 focus:outline-none transition-colors duration-300"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {session && (
              <>
                <Link
                  href="/todo"
                  className="text-gray-700 hover:text-sky-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300"
                >
                  Calendar
                </Link>
                <Link
                  href="/board"
                  className="text-gray-700 hover:text-sky-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300"
                >
                  Board
                </Link>
              </>
            )}
            {session ? (
              <>
                <div className="text-gray-700 px-3 py-2 text-base">
                  {session.user?.name}
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full text-left bg-gradient-to-r from-sky-400 to-blue-500 text-white px-4 py-2 rounded-md text-base font-medium hover:from-sky-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/auth/signin"
                  className="block bg-gradient-to-r from-sky-400 to-blue-500 text-white px-4 py-2 rounded-md text-base font-medium hover:from-sky-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block bg-white text-sky-600 border-2 border-sky-500 px-4 py-2 rounded-md text-base font-medium hover:bg-sky-50 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 