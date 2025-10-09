-- Ensure leads table exists with proper structure
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  message text,
  status text default 'new',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.leads enable row level security;

-- Allow public to insert leads (for demo form)
create policy "Anyone can insert leads"
  on public.leads for insert
  with check (true);

-- Only authenticated users can view/update leads
create policy "Authenticated users can view all leads"
  on public.leads for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can update leads"
  on public.leads for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete leads"
  on public.leads for delete
  using (auth.role() = 'authenticated');
