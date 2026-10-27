CREATE TABLE public.dater_profiles (
  user_id uuid PRIMARY KEY,
  name text NOT NULL DEFAULT '' CHECK (char_length(name) <= 60),
  city text NOT NULL DEFAULT '' CHECK (char_length(city) <= 80),
  bio text NOT NULL DEFAULT '' CHECK (char_length(bio) <= 500),
  interests text[] NOT NULL DEFAULT '{}',
  photos text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dater_profiles TO authenticated;
GRANT ALL ON public.dater_profiles TO service_role;
ALTER TABLE public.dater_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile read" ON public.dater_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own profile insert" ON public.dater_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own profile update" ON public.dater_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own profile delete" ON public.dater_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own photos read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'dater-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Own photos insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'dater-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Own photos delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'dater-photos' AND (storage.foldername(name))[1] = auth.uid()::text);