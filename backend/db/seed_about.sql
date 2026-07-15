-- About page content blocks
INSERT INTO content_blocks (block_key, block_value_en, block_value_am) VALUES
('about_history_title', 'Our History', 'PLACEHOLDER AMHARIC TEXT'),
('about_history_body', 'Placeholder history text describing when and why Alpha Special Secondary School was founded, and its journey since then.', 'PLACEHOLDER AMHARIC TEXT'),
('about_mission_title', 'Our Mission', 'PLACEHOLDER AMHARIC TEXT'),
('about_mission_body', 'Placeholder mission statement describing the school''s commitment to inclusive, high-quality education for deaf students.', 'PLACEHOLDER AMHARIC TEXT'),
('about_staff_title', 'Our Team', 'PLACEHOLDER AMHARIC TEXT')
ON CONFLICT (block_key) DO NOTHING;

-- Staff placeholders
INSERT INTO staff (name, role_en, role_am, bio_en, bio_am, photo_url, sort_order) VALUES
('Placeholder Name', 'Principal', 'PLACEHOLDER AMHARIC TEXT', 'Placeholder bio text for the principal.', 'PLACEHOLDER AMHARIC TEXT', NULL, 1),
('Placeholder Name', 'Head Teacher', 'PLACEHOLDER AMHARIC TEXT', 'Placeholder bio text for the head teacher.', 'PLACEHOLDER AMHARIC TEXT', NULL, 2),
('Placeholder Name', 'Sign Language Coordinator', 'PLACEHOLDER AMHARIC TEXT', 'Placeholder bio text for the coordinator.', 'PLACEHOLDER AMHARIC TEXT', NULL, 3);