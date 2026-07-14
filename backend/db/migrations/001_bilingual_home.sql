-- content_blocks: split into EN/AM
ALTER TABLE content_blocks RENAME COLUMN block_value TO block_value_en;
ALTER TABLE content_blocks ADD COLUMN block_value_am TEXT;

-- stats
ALTER TABLE stats RENAME COLUMN label TO label_en;
ALTER TABLE stats ADD COLUMN label_am VARCHAR(255);

-- programs
ALTER TABLE programs RENAME COLUMN title TO title_en;
ALTER TABLE programs ADD COLUMN title_am VARCHAR(255);
ALTER TABLE programs RENAME COLUMN description TO description_en;
ALTER TABLE programs ADD COLUMN description_am TEXT;

-- donor_logos: logo_url made optional (placeholders until real logos uploaded)
ALTER TABLE donor_logos ALTER COLUMN logo_url DROP NOT NULL;