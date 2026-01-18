-- Create admin user
-- Note: We can't directly insert into auth.users, so we'll add admin role for existing user
-- The user will need to sign up first, then we add them as admin

-- First, let's check if we have any existing admin in user_roles and add sample temples/pundits

-- Insert sample temples if not exists
INSERT INTO public.temples (name, deity, city, state, location, description, is_active, is_partner)
SELECT * FROM (VALUES
  ('Siddhivinayak Temple', 'Lord Ganesha', 'Mumbai', 'Maharashtra', 'Prabhadevi, Mumbai', 'One of the most popular Ganesh temples in India', true, true),
  ('Kashi Vishwanath Temple', 'Lord Shiva', 'Varanasi', 'Uttar Pradesh', 'Varanasi, UP', 'One of the twelve Jyotirlingas dedicated to Lord Shiva', true, true),
  ('Meenakshi Amman Temple', 'Goddess Meenakshi', 'Madurai', 'Tamil Nadu', 'Madurai, TN', 'Historic Hindu temple dedicated to Meenakshi', true, false),
  ('Tirupati Balaji Temple', 'Lord Venkateswara', 'Tirupati', 'Andhra Pradesh', 'Tirumala Hills', 'The most visited religious place in the world', true, true),
  ('Vaishno Devi Temple', 'Goddess Vaishno Devi', 'Katra', 'Jammu & Kashmir', 'Trikuta Mountains', 'One of the most revered Hindu shrines', true, false)
) AS v(name, deity, city, state, location, description, is_active, is_partner)
WHERE NOT EXISTS (SELECT 1 FROM public.temples LIMIT 1);

-- Insert sample pundits if not exists
INSERT INTO public.pundits (name, specializations, languages, experience_years, location, bio, is_active, is_verified)
SELECT * FROM (VALUES
  ('Pandit Raghunath Sharma', ARRAY['Vedic Rituals', 'Graha Shanti', 'Navagraha Pooja'], ARRAY['Hindi', 'Sanskrit', 'English'], 25, 'Varanasi, UP', 'Expert in Vedic rituals with 25 years of experience', true, true),
  ('Acharya Venkatesh Iyer', ARRAY['Homam', 'Abhishekam', 'Temple Rituals'], ARRAY['Tamil', 'Sanskrit', 'English'], 30, 'Chennai, TN', 'Renowned priest from a traditional Brahmin family', true, true),
  ('Pandit Krishna Das', ARRAY['Satyanarayan Katha', 'Lakshmi Pooja', 'Griha Pravesh'], ARRAY['Hindi', 'Marathi', 'English'], 15, 'Pune, MH', 'Specialized in household rituals and poojas', true, true),
  ('Swami Anand Giri', ARRAY['Meditation', 'Yoga', 'Spiritual Counseling'], ARRAY['Hindi', 'English'], 20, 'Rishikesh, UK', 'Spiritual guide and yoga master', true, true),
  ('Pandit Suresh Mishra', ARRAY['Kaal Sarp Dosha', 'Mangal Dosha', 'Pitru Dosha'], ARRAY['Hindi', 'Sanskrit'], 18, 'Ujjain, MP', 'Expert in dosha nivaran rituals', true, false)
) AS v(name, specializations, languages, experience_years, location, bio, is_active, is_verified)
WHERE NOT EXISTS (SELECT 1 FROM public.pundits LIMIT 1);