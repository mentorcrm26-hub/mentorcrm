-- Migration: Add is_vip column to tenants

ALTER TABLE public.tenants 
ADD COLUMN is_vip boolean DEFAULT false;
