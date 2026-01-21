-- Add gotra column to gift_bookings for Archana video flow
ALTER TABLE public.gift_bookings 
ADD COLUMN IF NOT EXISTS gotra TEXT;