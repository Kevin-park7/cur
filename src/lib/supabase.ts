import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  role: string;
  level: number;
  points: number;
  is_verified: boolean;
  last_active_at?: string;
  created_at: string;
  updated_at: string;
};

export type UserSettings = {
  id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  theme: string;
  language: string;
  created_at: string;
  updated_at: string;
};

export type Todo = {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  status: string;
  views: number;
  likes_count: number;
  comments_count: number;
  is_featured: boolean;
  is_deleted: boolean;
  published_at?: string;
  author_id: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  content: string;
  likes_count: number;
  is_deleted: boolean;
  author_id: string;
  post_id: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}; 