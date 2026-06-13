-- Schema for the expense tracker.
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('income', 'expense')),
  amount numeric(14, 2) not null check (amount >= 0),
  category text not null default '',
  note text not null default '',
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists transactions_date_idx on public.transactions (date desc);

-- Row Level Security.
alter table public.transactions enable row level security;

-- NOTE: This demo policy allows anyone with the anon key full access.
-- For production, scope access to authenticated users, e.g. add a `user_id`
-- column and restrict rows with `auth.uid() = user_id`.
drop policy if exists "Public access" on public.transactions;
create policy "Public access"
  on public.transactions
  for all
  using (true)
  with check (true);
