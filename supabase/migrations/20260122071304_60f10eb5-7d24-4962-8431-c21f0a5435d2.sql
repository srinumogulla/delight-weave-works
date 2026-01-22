-- Add gender column to profiles table for accurate Vedic astrology calculations
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;

-- Add comment explaining usage
COMMENT ON COLUMN public.profiles.gender IS 'Gender for Vedic astrology calculations (male/female). Critical for Mangal Dosha, Nakshatra compatibility, and gender-specific remedies.';