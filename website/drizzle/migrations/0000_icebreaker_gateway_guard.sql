CREATE TABLE public.ai_gateway_guard (
  feature text PRIMARY KEY,
  message text NOT NULL,
  status integer NOT NULL,
  blocked_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_gateway_guard TO service_role;
ALTER TABLE public.ai_gateway_guard ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.ai_gateway_guard IS 'Server-only terminal provider-denial circuit breaker. Clear only after provider access is restored.';
CREATE TABLE public.ai_request_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  requests integer NOT NULL DEFAULT 1
);
GRANT ALL ON public.ai_request_limits TO service_role;
ALTER TABLE public.ai_request_limits ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.claim_icebreaker_request(request_key text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE count_now integer;
BEGIN
  INSERT INTO public.ai_request_limits AS limits (key) VALUES (request_key)
  ON CONFLICT (key) DO UPDATE SET
    requests = CASE WHEN limits.window_start < now() - interval '1 minute' THEN 1 ELSE limits.requests + 1 END,
    window_start = CASE WHEN limits.window_start < now() - interval '1 minute' THEN now() ELSE limits.window_start END
  RETURNING requests INTO count_now;
  RETURN count_now <= 5;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_icebreaker_request(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_icebreaker_request(text) TO service_role;