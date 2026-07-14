-- Clear existing placeholder data (safe for dev re-runs)
TRUNCATE content_blocks, stats, programs, donor_logos RESTART IDENTITY;

-- content_blocks
INSERT INTO content_blocks (block_key, block_value_en, block_value_am) VALUES
('home_hero_title', 'Empowering Deaf Students Through Quality Education', 'PLACEHOLDER AMHARIC TEXT'),
('home_hero_subtitle', 'Alpha Special Secondary School for the Deaf — Bole Japan, Addis Ababa', 'PLACEHOLDER AMHARIC TEXT'),
('home_about_teaser', 'For years, Alpha Special Secondary School has provided inclusive, high-quality education tailored to the needs of deaf students in Addis Ababa.', 'PLACEHOLDER AMHARIC TEXT'),
('home_cta_text', 'Support Our Students', 'PLACEHOLDER AMHARIC TEXT');

-- stats
INSERT INTO stats (label_en, label_am, value, sort_order) VALUES
('Students Enrolled', 'PLACEHOLDER AMHARIC TEXT', '250+', 1),
('Certified Teachers', 'PLACEHOLDER AMHARIC TEXT', '30+', 2),
('Programs Offered', 'PLACEHOLDER AMHARIC TEXT', '8', 3),
('Years of Service', 'PLACEHOLDER AMHARIC TEXT', '15+', 4);

-- programs
INSERT INTO programs (title_en, title_am, description_en, description_am, image_url, sort_order) VALUES
('Vocational Training', 'PLACEHOLDER AMHARIC TEXT', 'Hands-on skills training preparing students for employment.', 'PLACEHOLDER AMHARIC TEXT', NULL, 1),
('Academic Studies', 'PLACEHOLDER AMHARIC TEXT', 'A full academic curriculum adapted for deaf learners.', 'PLACEHOLDER AMHARIC TEXT', NULL, 2),
('Sign Language Development', 'PLACEHOLDER AMHARIC TEXT', 'Programs supporting sign language fluency and communication.', 'PLACEHOLDER AMHARIC TEXT', NULL, 3);

-- donor_logos (placeholders, no real logos yet)
INSERT INTO donor_logos (name, logo_url, link_url, sort_order) VALUES
('Donor One', NULL, '#', 1),
('Donor Two', NULL, '#', 2),
('Donor Three', NULL, '#', 3),
('Donor Four', NULL, '#', 4);