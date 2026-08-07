-- Schema for the expense tracker (with per-user auth).
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
-- Safe to re-run: it is idempotent.

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(14, 2) not null check (amount >= 0),
  category text not null default '',
  note text not null default '',
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- If the table already existed without user_id, add it.
alter table public.transactions
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

create index if not exists transactions_date_idx on public.transactions (date desc);
create index if not exists transactions_user_idx on public.transactions (user_id);

-- Row Level Security: each user can only access their own rows.
alter table public.transactions enable row level security;

drop policy if exists "Public access" on public.transactions;
drop policy if exists "Users select own transactions" on public.transactions;
drop policy if exists "Users insert own transactions" on public.transactions;
drop policy if exists "Users update own transactions" on public.transactions;
drop policy if exists "Users delete own transactions" on public.transactions;

create policy "Users select own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);
