-- Create leads table for lead collection and outreach
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  company_name text,
  phone text,
  message text,
  status text default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'lost')),
  source text default 'website',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  last_contacted_at timestamp with time zone,
  notes text
);

-- Create index for faster queries
create index if not exists leads_email_idx on public.leads(email);
create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_created_at_idx on public.leads(created_at desc);

-- Enable Row Level Security
alter table public.leads enable row level security;

-- Policy: Anyone can insert leads (for the public form)
create policy "Anyone can insert leads"
  on public.leads for insert
  with check (true);

-- Policy: Only authenticated users can view leads (for admin dashboard)
create policy "Authenticated users can view all leads"
  on public.leads for select
  using (auth.uid() is not null);

-- Policy: Only authenticated users can update leads
create policy "Authenticated users can update leads"
  on public.leads for update
  using (auth.uid() is not null);

-- Policy: Only authenticated users can delete leads
create policy "Authenticated users can delete leads"
  on public.leads for delete
  using (auth.uid() is not null);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger to automatically update updated_at
drop trigger if exists leads_updated_at on public.leads;
create trigger leads_updated_at
  before update on public.leads
  for each row
  execute function public.handle_updated_at();
