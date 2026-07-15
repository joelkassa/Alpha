INSERT INTO content_blocks (block_key, block_value_en, block_value_am) VALUES
('donate_hero_title', 'Support Our Students', 'PLACEHOLDER AMHARIC TEXT'),
('donate_hero_subtitle', 'Your contribution helps provide quality education and resources for deaf students at Alpha Special Secondary School.', 'PLACEHOLDER AMHARIC TEXT'),
('donate_note', 'You will receive a confirmation directly from your bank or Telebirr once payment is complete.', 'PLACEHOLDER AMHARIC TEXT'),
('donate_thankyou_title', 'Thank You!', 'PLACEHOLDER AMHARIC TEXT'),
('donate_thankyou_message', 'Your generosity makes a real difference in our students'' lives. We deeply appreciate your support.', 'PLACEHOLDER AMHARIC TEXT')
ON CONFLICT (block_key) DO NOTHING;