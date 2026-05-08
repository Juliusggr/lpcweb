-- Run this in your Supabase SQL Editor to add the password column to the clientes table

ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Optional: Add a comment
COMMENT ON COLUMN clientes.password IS 'Hashed password for web access';
