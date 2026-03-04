-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Reviewers assigned to submissions (submission_id is the Gradescope PDF number)
create table reviewers (
  id uuid primary key default gen_random_uuid(),
  submission_id text not null,
  name text not null,
  email text not null
);

-- Reviews submitted by reviewers
create table reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id text not null,
  reviewer_id uuid references reviewers(id) on delete cascade not null,
  score integer not null check (score >= 1 and score <= 10),
  comments text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security (allow all for simplicity)
alter table reviewers enable row level security;
alter table reviews enable row level security;

create policy "Allow all on reviewers" on reviewers for all using (true) with check (true);
create policy "Allow all on reviews" on reviews for all using (true) with check (true);

-- Create storage bucket for PDFs in the Supabase dashboard:
-- Storage → New Bucket → name: "papers", public: true
