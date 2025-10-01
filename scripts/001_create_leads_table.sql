-- Create leads table to store demo booking form submissions
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  company text not null,
  company_size text not null,
  current_challenges text not null,
  preferred_date text not null,
  preferred_time text not null,
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.leads enable row level security;

-- Policy: Allow anyone to insert leads (public form submission)
create policy "Anyone can insert leads"
  on public.leads
  for insert
  with check (true);

-- Policy: Only authenticated users can view leads (for future admin access)
create policy "Authenticated users can view leads"
  on public.leads
  for select
  using (auth.uid() is not null);

-- Policy: Only authenticated users can update leads
create policy "Authenticated users can update leads"
  on public.leads
  for update
  using (auth.uid() is not null);

-- Policy: Only authenticated users can delete leads
create policy "Authenticated users can delete leads"
  on public.leads
  for delete
  using (auth.uid() is not null);

-- Create index on email for faster lookups
create index if not exists leads_email_idx on public.leads(email);

-- Create index on created_at for sorting
create index if not exists leads_created_at_idx on public.leads(created_at desc);
