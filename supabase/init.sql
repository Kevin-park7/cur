-- 기존 테이블 삭제
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.todos CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- profiles 테이블 생성 (auth.users와 연동)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    role TEXT DEFAULT 'USER',
    level INTEGER DEFAULT 1,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- todos 테이블 생성
CREATE TABLE public.todos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    text TEXT NOT NULL,
    date DATE,
    completed BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- posts 테이블 생성
CREATE TABLE public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    views INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false
);

-- comments 테이블 생성
CREATE TABLE public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- likes 테이블 생성
CREATE TABLE public.likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, post_id)
);

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- RLS 정책 설정
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin users can view all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );

CREATE POLICY "Users can CRUD their own todos" ON public.todos
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view posts" ON public.posts
    FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON public.posts
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comments" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view likes" ON public.likes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own likes" ON public.likes
    FOR ALL USING (auth.uid() = user_id);

-- 새 사용자 가입 시 자동으로 프로필 생성하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (new.id, new.email, 'USER');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 새 사용자 가입 시 트리거 설정
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 샘플 데이터 생성
-- 1. 관리자 프로필 생성
INSERT INTO public.profiles (id, email, role, level, points)
VALUES (
    '00000000-0000-0000-0000-000000000000',  -- 실제 관리자 UUID로 변경 필요
    'admin@example.com',
    'ADMIN',
    10,
    1000
);

-- 2. 샘플 할일 생성 (100개)
INSERT INTO public.todos (text, date, completed, user_id)
SELECT 
    '할일 ' || generate_series,
    current_date - (random() * 30)::integer,
    random() > 0.5,
    '00000000-0000-0000-0000-000000000000'  -- 실제 관리자 UUID로 변경 필요
FROM generate_series(1, 100);

-- 3. 샘플 게시글 생성 (100개)
INSERT INTO public.posts (title, content, user_id, views, is_deleted)
SELECT 
    '게시글 제목 ' || generate_series,
    '게시글 내용 ' || generate_series || E'\n\n이것은 샘플 게시글입니다.',
    '00000000-0000-0000-0000-000000000000',  -- 실제 관리자 UUID로 변경 필요
    floor(random() * 1000),
    random() > 0.9
FROM generate_series(1, 100);

-- 4. 샘플 댓글 생성 (100개)
INSERT INTO public.comments (content, user_id, post_id)
SELECT 
    '댓글 내용 ' || generate_series,
    '00000000-0000-0000-0000-000000000000',  -- 실제 관리자 UUID로 변경 필요
    (SELECT id FROM public.posts ORDER BY random() LIMIT 1)
FROM generate_series(1, 100);

-- 5. 샘플 좋아요 생성 (100개)
INSERT INTO public.likes (user_id, post_id)
SELECT 
    '00000000-0000-0000-0000-000000000000',  -- 실제 관리자 UUID로 변경 필요
    (SELECT id FROM public.posts ORDER BY random() LIMIT 1)
FROM generate_series(1, 100)
ON CONFLICT (user_id, post_id) DO NOTHING; 