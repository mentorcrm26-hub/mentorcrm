-- Migration: Add plan column to tenants
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'sandbox';
