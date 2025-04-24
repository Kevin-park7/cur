'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Navigation from '@/components/Navigation';
import './calendar.css';

interface Todo {
  id: string;
  text: string;
  date: string;
  completed: boolean;
}

// 공휴일 데이터
const holidays: { [key: string]: string } = {
  '2024-01-01': '신정',
  '2024-02-09': '설날',
  '2024-02-10': '설날',
  '2024-02-11': '설날',
  '2024-02-12': '대체공휴일',
  '2024-03-01': '삼일절',
  '2024-04-10': '21대 총선',
  '2024-05-05': '어린이날',
  '2024-05-06': '대체공휴일',
  '2024-05-15': '부처님오신날',
  '2024-06-06': '현충일',
  '2024-08-15': '광복절',
  '2024-09-16': '추석',
  '2024-09-17': '추석',
  '2024-09-18': '추석',
  '2024-10-03': '개천절',
  '2024-10-09': '한글날',
  '2024-12-25': '크리스마스'
};

export default function TodoPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    fetchTodos();
  }, [session]);

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos');
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTodosForDate = (date: Date) => {
    return todos.filter(todo => {
      const todoDate = new Date(todo.date);
      return (
        todoDate.getDate() === date.getDate() &&
        todoDate.getMonth() === date.getMonth() &&
        todoDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newTodo,
          date: selectedDate.toISOString(),
        }),
      });

      if (res.ok) {
        const newTodoItem = await res.json();
        setTodos([...todos, newTodoItem]);
        setNewTodo('');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const res = await fetch('/api/todos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setTodos(todos.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const getHolidayName = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return holidays[dateString];
  };

  const getTileContent = ({ date }: { date: Date }) => {
    const holiday = getHolidayName(date);
    if (holiday) {
      return (
        <div className="holiday-name">
          {holiday}
        </div>
      );
    }
    return null;
  };

  const getTileClassName = ({ date }: { date: Date }) => {
    const classes = [];
    const hasTask = getTodosForDate(date).length > 0;
    if (hasTask) classes.push('has-task');
    if (getHolidayName(date)) classes.push('holiday');
    return classes.join(' ');
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 font-playfair">나의 할 일</h1>
            
            {/* Todo Input Section */}
            <div className="mb-8">
              <form onSubmit={handleAddTodo} className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="새로운 할 일을 입력하세요..."
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-inter text-gray-700 placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-sky-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl font-poppins"
                  >
                    추가하기
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Calendar Section */}
              <div className="order-2 md:order-1">
                <Calendar
                  onChange={(value: any) => {
                    if (value instanceof Date) {
                      setSelectedDate(value);
                    }
                  }}
                  value={selectedDate}
                  className="w-full border-none rounded-lg shadow-md custom-calendar"
                  tileClassName={getTileClassName}
                  tileContent={getTileContent}
                  formatDay={(locale, date) => date.getDate().toString()}
                  formatMonth={(locale, date) => `${date.getMonth() + 1}월`}
                  formatYear={(locale, date) => `${date.getFullYear()}년`}
                  formatMonthYear={(locale, date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`}
                  navigationLabel={({ date }) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`}
                />
              </div>

              {/* Tasks List Section */}
              <div className="order-1 md:order-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 font-playfair">
                  {formatDate(selectedDate)}의 할 일
                  {getHolidayName(selectedDate) && (
                    <span className="ml-2 text-red-500">
                      ({getHolidayName(selectedDate)})
                    </span>
                  )}
                </h2>
                <div className="space-y-3">
                  {getTodosForDate(selectedDate).length === 0 ? (
                    <p className="text-gray-500 text-center py-4">등록된 할 일이 없습니다.</p>
                  ) : (
                    getTodosForDate(selectedDate).map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <span className="font-inter text-gray-700">{todo.text}</span>
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="text-red-500 hover:text-red-600 transition-colors duration-200"
                        >
                          삭제
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 