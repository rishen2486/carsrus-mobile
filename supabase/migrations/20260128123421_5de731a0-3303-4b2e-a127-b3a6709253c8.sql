-- Enable RLS on Location table
ALTER TABLE public."Location" ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read locations
CREATE POLICY "Locations are viewable by everyone" 
ON public."Location" 
FOR SELECT 
USING (true);