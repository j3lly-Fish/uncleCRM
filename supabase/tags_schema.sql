-- SQL Schema for Tagging System (Run this in your Supabase SQL Editor)

-- Tags Table
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6', -- Default blue
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name) -- Prevent duplicate tag names per user
);

-- Enable RLS for Tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tags" ON tags
  FOR ALL USING (auth.uid() = user_id);


-- Contact Tags Junction Table (Many-to-Many)
CREATE TABLE contact_tags (
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, tag_id)
);

-- Enable RLS for Contact Tags
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;

-- Note: We check if the user owns the contact before allowing them to manage the link
CREATE POLICY "Users can manage their own contact tags" ON contact_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = contact_tags.contact_id 
      AND contacts.user_id = auth.uid()
    )
  );

-- Create some default tags for a better first experience
-- These will be created when the user runs the script, 
-- but since we need a user_id, we'll leave this to the app logic or 
-- the user can manually add them.
