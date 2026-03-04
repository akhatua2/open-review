-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Submissions table
create table submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author_name text not null,
  author_email text not null,
  pdf_url text,
  created_at timestamptz default now()
);

-- Reviewers assigned to submissions
create table reviewers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references submissions(id) on delete cascade not null,
  name text not null,
  email text not null
);

-- Reviews submitted by reviewers
create table reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references submissions(id) on delete cascade not null,
  reviewer_id uuid references reviewers(id) on delete cascade not null,
  score integer not null check (score >= 1 and score <= 10),
  comments text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security (allow all for simplicity — add policies for production)
alter table submissions enable row level security;
alter table reviewers enable row level security;
alter table reviews enable row level security;

create policy "Allow all on submissions" on submissions for all using (true) with check (true);
create policy "Allow all on reviewers" on reviewers for all using (true) with check (true);
create policy "Allow all on reviews" on reviews for all using (true) with check (true);

-- Create storage bucket for PDFs
-- Note: You also need to create a storage bucket called "papers" in the Supabase dashboard
-- (Storage → New Bucket → name: "papers", public: true)
