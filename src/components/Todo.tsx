'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Todo } from '@/lib/supabase';

export default function TodoComponent() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState({ title: '', description: '', due_date: '', priority: 'medium' });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            ...newTodo,
            user_id: user.id,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setTodos([data, ...todos]);
      setNewTodo({ title: '', description: '', due_date: '', priority: 'medium' });
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, status } : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">할 일 목록</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="제목"
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <textarea
            placeholder="설명"
            value={newTodo.description}
            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="datetime-local"
            value={newTodo.due_date}
            onChange={(e) => setNewTodo({ ...newTodo, due_date: e.target.value })}
            className="border p-2 rounded"
          />
          <select
            value={newTodo.priority}
            onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="low">낮음</option>
            <option value="medium">중간</option>
            <option value="high">높음</option>
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            추가
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{todo.title}</h3>
                <p className="text-gray-600">{todo.description}</p>
                {todo.due_date && (
                  <p className="text-sm text-gray-500">
                    마감일: {new Date(todo.due_date).toLocaleString()}
                  </p>
                )}
                <span className={`inline-block px-2 py-1 rounded text-sm ${
                  todo.priority === 'high' ? 'bg-red-100 text-red-800' :
                  todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {todo.priority === 'high' ? '높음' :
                   todo.priority === 'medium' ? '중간' : '낮음'}
                </span>
              </div>
              <div className="flex space-x-2">
                <select
                  value={todo.status}
                  onChange={(e) => handleStatusChange(todo.id, e.target.value)}
                  className="border rounded p-1"
                >
                  <option value="pending">대기중</option>
                  <option value="in_progress">진행중</option>
                  <option value="completed">완료</option>
                </select>
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 