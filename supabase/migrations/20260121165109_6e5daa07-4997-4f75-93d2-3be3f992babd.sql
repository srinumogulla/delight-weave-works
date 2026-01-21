-- =============================================
-- VEDHAMANTRA DATABASE SCHEMA MIGRATION
-- =============================================

-- Note: app_role enum, profiles, user_roles, temples, pundits, pooja_services, 
-- bookings, gift_bookings, events, saved_poojas, saved_items tables already exist
-- This migration ensures all required structures are in place

-- Add any missing columns to existing tables if needed
-- (Tables are already created based on the schema provided)

-- Ensure all triggers exist
DROP TRIGGER IF EXISTS update_temples_updated_at ON public.temples;
CREATE TRIGGER update_temples_updated_at
  BEFORE UPDATE ON public.temples
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pundits_updated_at ON public.pundits;
CREATE TRIGGER update_pundits_updated_at
  BEFORE UPDATE ON public.pundits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_gift_bookings_updated_at ON public.gift_bookings;
CREATE TRIGGER update_gift_bookings_updated_at
  BEFORE UPDATE ON public.gift_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();