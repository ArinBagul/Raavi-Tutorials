-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  type text not null check (type in ('student', 'teacher', 'admin')),
  username text unique not null,
  name text not null,
  email text unique not null,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Common fields
  gender text,
  address text,
  photo text,
  document_urls jsonb,
  
  -- Student specific fields
  blood_group text,
  nationality text,
  religion text,
  category text,
  aadhaar text unique,
  current_class text,
  board text,
  school text,
  medium text,
  selected_subjects jsonb,
  parent_info jsonb,
  emergency_contact jsonb,
  payment_info jsonb,
  
  -- Teacher specific fields
  subjects jsonb,
  employment_type text,
  available_hours text,
  qualifications jsonb,
  experience jsonb,
  teaching_approach text,
  expected_salary numeric,
  certifications jsonb
);

-- Create contact_messages table
create table contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  phone text not null,
  message text not null,
  created_at timestamptz default now(),
  resolved boolean default false
);

-- Create teaching_assignments table
create table teaching_assignments (
  id uuid default uuid_generate_v4() primary key,
  teacher_id uuid references profiles(id) on delete restrict,
  student_id uuid references profiles(id) on delete restrict,
  subjects jsonb not null,
  schedule jsonb not null,
  start_date date not null,
  end_date date,
  status text not null check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table contact_messages enable row level security;
alter table teaching_assignments enable row level security;

-- Create RLS policies
-- Profiles: Users can read all profiles but only update their own
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Contact messages: Admin can read all, others can only create
create policy "Anyone can create contact messages"
  on contact_messages for insert
  with check (true);

create policy "Only admins can view contact messages"
  on contact_messages for select
  using (exists (
    select 1 from profiles
    where id = auth.uid()
    and type = 'admin'
  ));

-- Teaching assignments: Teachers and students can view their own assignments
create policy "Users can view own teaching assignments"
  on teaching_assignments for select
  using (
    auth.uid() = teacher_id
    or auth.uid() = student_id
    or exists (
      select 1 from profiles
      where id = auth.uid()
      and type = 'admin'
    )
  );

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, type, username, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'type', 'student'),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();