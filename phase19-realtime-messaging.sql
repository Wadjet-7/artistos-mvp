-- Phase 19: Enable Realtime on messaging tables
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Enable Realtime replication for the messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable Realtime replication for the conversations table
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
