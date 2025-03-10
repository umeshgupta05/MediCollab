/*
  # Fix user_settings foreign key constraint

  1. Changes
    - Modify user_settings table to use auth.users as foreign key reference instead of profiles
    - This ensures settings can be created even if a profile doesn't exist yet

  2. Security
    - Maintain RLS policies for user_settings
    - Ensure users can only access their own settings
*/

-- First drop the existing constraint
ALTER TABLE user_settings 
DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;

-- Add the new constraint referencing auth.users directly
ALTER TABLE user_settings
ADD CONSTRAINT user_settings_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id);