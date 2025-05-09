'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import 'react-calendar/dist/Calendar.css';
import './calendar.css';

type Priority = 'low' | 'medium' | 'high';
type TodoStatus = 'pending' | 'completed' | 'cancelled';

// Calendar 타입 정의
type CalendarValue = Date | Date[] | null;

interface Todo {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: Priority;
  status: TodoStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
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
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/todos', {
        signal: abortControllerRef.current.signal
      });
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Error fetching todos:', error);
      setError('할 일을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchTodos();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [status, router]);

  const handleDateChange = useCallback((value: CalendarValue) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setSelectedDate(value[0]);
    } else {
      setSelectedDate(null);
    }
  }, []);

  const handleAddTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!session?.user) {
      alert('로그인이 필요합니다.');
      router.push('/auth/login');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as Priority;

    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description?.trim(),
          priority,
          dueDate: selectedDate,
          status: 'pending' as TodoStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create todo');
      }

      await fetchTodos();
      e.currentTarget.reset();
      setSelectedDate(new Date());
    } catch (error) {
      console.error('Error creating todo:', error);
      alert(error instanceof Error ? error.message : '할 일 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (!confirm('정말로 이 할 일을 삭제하시겠습니까?')) {
      return;
    }

    try {
      if (!session?.user) {
        alert('로그인이 필요합니다.');
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete todo');
      }

      await fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert(error instanceof Error ? error.message : '할 일 삭제 중 오류가 발생했습니다.');
    }
  };

  const getTodosForDate = useCallback((date: Date) => {
    return todos.filter(todo => {
      if (!todo.dueDate) return false;
      const todoDate = new Date(todo.dueDate);
      const compareDate = new Date(date);
      
      return (
        todoDate.getUTCDate() === compareDate.getUTCDate() &&
        todoDate.getUTCMonth() === compareDate.getUTCMonth() &&
        todoDate.getUTCFullYear() === compareDate.getUTCFullYear()
      );
    });
  }, [todos]);

  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }, []);

  const getHolidayName = useCallback((date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return holidays[dateString];
  }, []);

  const getTileContent = useCallback(({ date }: { date: Date }) => {
    const holiday = getHolidayName(date);
    if (holiday) {
      return (
        <div className="holiday-name" role="text" aria-label={`${formatDate(date)} ${holiday}`}>
          {holiday}
        </div>
      );
    }
    return null;
  }, [getHolidayName, formatDate]);

  const getTileClassName = useCallback(({ date }: { date: Date }) => {
    const classes = [];
    const hasTask = getTodosForDate(date).length > 0;
    if (hasTask) classes.push('has-task');
    if (getHolidayName(date)) classes.push('holiday');
    return classes.join(' ');
  }, [getTodosForDate, getHolidayName]);

  const priorityLabels = useMemo(() => ({
    low: '낮음',
    medium: '중간',
    high: '높음'
  }), []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="로딩 중">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]" role="status" aria-label="할 일 목록 로딩 중">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500 py-8" role="alert">
          {error}
          <Button
            variant="outline"
            className="mt-4"
            onClick={fetchTodos}
            aria-label="다시 시도"
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">할 일 관리</h1>
            <form onSubmit={handleAddTodo} className="space-y-4" aria-label="할 일 추가 폼">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  제목
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  maxLength={100}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  disabled={isSubmitting}
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  설명
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  maxLength={500}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  disabled={isSubmitting}
                  aria-label="할 일 설명"
                />
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  우선순위
                </label>
                <select
                  id="priority"
                  name="priority"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  disabled={isSubmitting}
                  aria-required="true"
                >
                  <option value="low">{priorityLabels.low}</option>
                  <option value="medium">{priorityLabels.medium}</option>
                  <option value="high">{priorityLabels.high}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  마감일
                </label>
                <div>
                  <Calendar
                    onChange={handleDateChange}
                    value={selectedDate}
                    className="w-full"
                    tileContent={getTileContent}
                    tileClassName={getTileClassName}
                    disabled={isSubmitting}
                    aria-label="마감일 선택"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
                aria-label={isSubmitting ? "할 일 추가 중" : "할 일 추가"}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  '할 일 추가'
                )}
              </Button>
            </form>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">할 일 목록</h2>
            {todos.length === 0 ? (
              <p className="text-gray-500">등록된 할 일이 없습니다.</p>
            ) : (
              <div className="space-y-4" role="list" aria-label="할 일 목록">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                    role="listitem"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{todo.title}</h3>
                        {todo.description && (
                          <p className="mt-1 text-gray-600">{todo.description}</p>
                        )}
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>우선순위: {priorityLabels[todo.priority]}</span>
                          {todo.dueDate && (
                            <span>마감일: {formatDate(new Date(todo.dueDate))}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTodo(todo.id)}
                        disabled={isSubmitting}
                        aria-label={`${todo.title} 삭제`}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 