-- Haul social layer schema (Sprint 4)
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users (synced from Clerk on first login)
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  clerk_id text unique not null,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- Hauls (shared comparison sets)
create table if not exists hauls (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade not null,
  share_id text,
  title text,
  products jsonb not null default '[]',
  is_public boolean default true,
  circle_id uuid,
  created_at timestamptz default now()
);

-- Friendships
create table if not exists friendships (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid references users(id) on delete cascade not null,
  addressee_id uuid references users(id) on delete cascade not null,
  status text check (status in ('pending','accepted')) default 'pending',
  created_at timestamptz default now(),
  unique (requester_id, addressee_id)
);

-- Circles
create table if not exists circles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_by uuid references users(id) on delete cascade not null,
  invite_code text unique default substr(md5(random()::text), 1, 8),
  created_at timestamptz default now()
);

-- Circle members
create table if not exists circle_members (
  circle_id uuid references circles(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  role text check (role in ('owner','member')) default 'member',
  joined_at timestamptz default now(),
  primary key (circle_id, user_id)
);

-- Reactions
create table if not exists reactions (
  id uuid primary key default uuid_generate_v4(),
  haul_id uuid references hauls(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  emoji text not null,
  created_at timestamptz default now(),
  unique (haul_id, user_id, emoji)
);

-- Comments
create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  haul_id uuid references hauls(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists hauls_user_id_idx on hauls(user_id);
create index if not exists hauls_circle_id_idx on hauls(circle_id);
create index if not exists hauls_created_at_idx on hauls(created_at desc);
create index if not exists friendships_requester_idx on friendships(requester_id);
create index if not exists friendships_addressee_idx on friendships(addressee_id);
create index if not exists circle_members_user_idx on circle_members(user_id);
create index if not exists reactions_haul_idx on reactions(haul_id);
create index if not exists comments_haul_idx on comments(haul_id);

-- RLS
alter table users enable row level security;
alter table hauls enable row level security;
alter table friendships enable row level security;
alter table circles enable row level security;
alter table circle_members enable row level security;
alter table reactions enable row level security;
alter table comments enable row level security;

create policy "public users readable" on users for select using (true);
create policy "public hauls readable" on hauls for select using (is_public = true);
create policy "own hauls full access" on hauls for all using (auth.jwt() ->> 'sub' = (select clerk_id from users where id = user_id));
create policy "public circles readable" on circles for select using (true);
create policy "circle members readable" on circle_members for select using (true);
create policy "public comments readable" on comments for select using (true);
create policy "public reactions readable" on reactions for select using (true);
create policy "auth insert reactions" on reactions for insert with check (auth.jwt() is not null);
create policy "auth insert comments" on comments for insert with check (auth.jwt() is not null);
create policy "auth insert friendships" on friendships for insert with check (auth.jwt() is not null);
create policy "friendships readable" on friendships for select using (true);

-- Realtime publication
alter publication supabase_realtime add table hauls;
alter publication supabase_realtime add table reactions;
alter publication supabase_realtime add table comments;
