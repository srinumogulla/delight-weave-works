-- Add assigned_pundit_id and admin_notes to bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS assigned_pundit_id UUID REFERENCES public.pundits(id),
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add is_disabled to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT FALSE;

-- Add user_id and approval_status to temples
ALTER TABLE public.temples 
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved';

-- Create RLS policy for admins to read all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policy for pundits to view assigned bookings
CREATE POLICY "Pundits can view assigned bookings" 
ON public.bookings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pundits 
    WHERE pundits.user_id = auth.uid() 
    AND pundits.id = bookings.assigned_pundit_id
  )
);

-- Create RLS policy for pundits to update assigned bookings
CREATE POLICY "Pundits can update assigned bookings" 
ON public.bookings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.pundits 
    WHERE pundits.user_id = auth.uid() 
    AND pundits.id = bookings.assigned_pundit_id
  )
);

-- Create RLS policy for temples to view bookings for their services
CREATE POLICY "Temples can view their bookings" 
ON public.bookings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.temples t
    JOIN public.pooja_services ps ON ps.temple = t.name
    WHERE t.user_id = auth.uid() 
    AND ps.id = bookings.service_id
  )
);