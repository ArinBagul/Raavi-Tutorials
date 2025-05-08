-- Create storage buckets
insert into storage.buckets (id, name, public)
values 
  ('student-documents', 'Student Documents', false),
  ('teacher-documents', 'Teacher Documents', false),
  ('profile-photos', 'Profile Photos', true);

-- Create RLS policies for student documents
create policy "Users can upload their own student documents"
  on storage.objects for insert
  with check (
    bucket_id = 'student-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view their own student documents"
  on storage.objects for select
  using (
    bucket_id = 'student-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own student documents"
  on storage.objects for update
  using (
    bucket_id = 'student-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own student documents"
  on storage.objects for delete
  using (
    bucket_id = 'student-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create RLS policies for teacher documents
create policy "Users can upload their own teacher documents"
  on storage.objects for insert
  with check (
    bucket_id = 'teacher-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view their own teacher documents"
  on storage.objects for select
  using (
    bucket_id = 'teacher-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create RLS policies for profile photos (publicly viewable)
create policy "Anyone can view profile photos"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

create policy "Users can upload their own profile photos"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );