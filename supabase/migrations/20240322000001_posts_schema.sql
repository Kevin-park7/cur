-- Modify posts table
DROP TABLE IF EXISTS public.posts CASCADE;

CREATE TABLE public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    views INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Posts RLS policies
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view non-deleted posts
CREATE POLICY "Anyone can view non-deleted posts" ON public.posts
    FOR SELECT
    USING (NOT is_deleted);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts" ON public.posts
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own posts
CREATE POLICY "Users can update their own posts" ON public.posts
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can soft delete their own posts
CREATE POLICY "Users can soft delete their own posts" ON public.posts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (is_deleted = true);

-- Create view counter function
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.posts
    SET views = views + 1
    WHERE id = post_id;
END;
$$; 