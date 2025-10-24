-- Migration to add final_amount field to clients table
ALTER TABLE clients ADD COLUMN final_amount DECIMAL(10,2) DEFAULT 0.00;

-- Update existing clients to have final_amount equal to their pending_amount
-- This will be handled by the application logic
