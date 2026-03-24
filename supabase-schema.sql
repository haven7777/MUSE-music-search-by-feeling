-- Moments table
create table public.moments (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  original_input text not null,
  vibe_profile jsonb not null,
  tracks jsonb not null,
  created_at timestamptz default now() not null
);

alter table public.moments enable row level security;

create policy "Users manage their own moments"
  on public.moments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Saved songs table
create table public.saved_songs (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  artist text not null,
  cover_art text,
  spotify_url text,
  audius_url text,
  mood_label text,
  source text,
  created_at timestamptz default now() not null
);

alter table public.saved_songs enable row level security;

create policy "Users manage their own saved songs"
  on public.saved_songs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
