-- Add new columns to cars table for fuel type, deposit amount, and price per km
ALTER TABLE public.cars 
ADD COLUMN IF NOT EXISTS fuel_type text,
ADD COLUMN IF NOT EXISTS deposit_amount numeric,
ADD COLUMN IF NOT EXISTS price_per_km numeric;