-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Reviews submitted by graders
create table reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id text not null,
  grader_name text not null,
  score numeric not null,
  rubric_selections jsonb not null,
  additional_comments text,
  created_at timestamptz default now()
);

-- Enable Row Level Security (allow all for simplicity)
alter table reviews enable row level security;
create policy "Allow all on reviews" on reviews for all using (true) with check (true);

-- Create storage bucket for PDFs in the Supabase dashboard:
-- Storage → New Bucket → name: "papers", public: true
