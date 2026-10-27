CREATE TABLE public.pair_chat_threads (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 match_id text NOT NULL,
 profile_id text NOT NULL,
 dater jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id,match_id)
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.pair_chat_threads TO authenticated;
GRANT ALL ON public.pair_chat_threads TO service_role;
ALTER TABLE public.pair_chat_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own chat threads" ON public.pair_chat_threads FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TABLE public.pair_chat_messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 thread_id uuid NOT NULL REFERENCES public.pair_chat_threads(id) ON DELETE CASCADE,
 user_id uuid NOT NULL,
 message_key text NOT NULL,
 role text NOT NULL CHECK (role IN ('user','assistant')),
 parts jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(thread_id,message_key)
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.pair_chat_messages TO authenticated;
GRANT ALL ON public.pair_chat_messages TO service_role;
ALTER TABLE public.pair_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own chat messages" ON public.pair_chat_messages FOR ALL TO authenticated USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.pair_chat_threads t WHERE t.id=thread_id AND t.user_id=auth.uid())) WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.pair_chat_threads t WHERE t.id=thread_id AND t.user_id=auth.uid()));
CREATE INDEX pair_chat_messages_thread_order ON public.pair_chat_messages(thread_id,created_at);