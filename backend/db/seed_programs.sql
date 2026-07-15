-- A few more programs beyond the 3 from home page seed, so the full listing has content
INSERT INTO programs (title_en, title_am, description_en, description_am, image_url, sort_order) VALUES
('Sports & Recreation', 'PLACEHOLDER AMHARIC TEXT', 'Physical education and recreational activities adapted for deaf students.', 'PLACEHOLDER AMHARIC TEXT', NULL, 4),
('Arts & Crafts', 'PLACEHOLDER AMHARIC TEXT', 'Creative expression through visual arts and craft-based learning.', 'PLACEHOLDER AMHARIC TEXT', NULL, 5),
('Life Skills Training', 'PLACEHOLDER AMHARIC TEXT', 'Practical skills for independent living and community participation.', 'PLACEHOLDER AMHARIC TEXT', NULL, 6);

-- Gallery placeholders, some linked to programs, some general
INSERT INTO gallery_images (program_id, image_url, caption_en, caption_am, sort_order) VALUES
(NULL, NULL, 'Placeholder gallery caption 1', 'PLACEHOLDER AMHARIC TEXT', 1),
(NULL, NULL, 'Placeholder gallery caption 2', 'PLACEHOLDER AMHARIC TEXT', 2),
(NULL, NULL, 'Placeholder gallery caption 3', 'PLACEHOLDER AMHARIC TEXT', 3),
(NULL, NULL, 'Placeholder gallery caption 4', 'PLACEHOLDER AMHARIC TEXT', 4),
(NULL, NULL, 'Placeholder gallery caption 5', 'PLACEHOLDER AMHARIC TEXT', 5),
(NULL, NULL, 'Placeholder gallery caption 6', 'PLACEHOLDER AMHARIC TEXT', 6);