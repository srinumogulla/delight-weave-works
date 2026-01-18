-- Add admin management policies for temples
CREATE POLICY "Admins can insert temples" 
ON public.temples 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update temples" 
ON public.temples 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete temples" 
ON public.temples 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin management policies for pundits
CREATE POLICY "Admins can insert pundits" 
ON public.pundits 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pundits" 
ON public.pundits 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pundits" 
ON public.pundits 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));