-- Add a generated column for price_publish = price_per_day + 100
ALTER TABLE public.cars
ADD COLUMN price_publish numeric GENERATED ALWAYS AS (price_per_day + 100) STORED;