ALTER TABLE gallery_images RENAME COLUMN caption TO caption_en;
ALTER TABLE gallery_images ADD COLUMN caption_am VARCHAR(255);