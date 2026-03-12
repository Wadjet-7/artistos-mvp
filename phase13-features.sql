-- Phase 13: AI Features + Email Infrastructure
-- Add description column to artworks table for AI-generated descriptions

ALTER TABLE artworks ADD COLUMN IF NOT EXISTS description TEXT;
