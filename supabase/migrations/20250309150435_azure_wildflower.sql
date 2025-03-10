/*
  # Update user settings schema

  1. Changes
    - Add notification_preferences JSON object
    - Add privacy settings JSON object
    - Remove language field
    - Update default values

  2. Data Migration
    - Set default values for new fields
    - Preserve existing settings
*/

-- Add new columns with JSON objects
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"mentions": true, "research_updates": true, "collaboration_requests": true}'::jsonb,
ADD COLUMN IF NOT EXISTS privacy jsonb DEFAULT '{"profile_visible": true, "show_online_status": true, "allow_research_contact": true}'::jsonb;

-- Remove language column as it's no longer needed
ALTER TABLE user_settings DROP COLUMN IF EXISTS language;

-- Update existing rows with default values if they're null
UPDATE user_settings
SET notification_preferences = COALESCE(
  notification_preferences,
  '{"mentions": true, "research_updates": true, "collaboration_requests": true}'::jsonb
);

UPDATE user_settings
SET privacy = COALESCE(
  privacy,
  '{"profile_visible": true, "show_online_status": true, "allow_research_contact": true}'::jsonb
);