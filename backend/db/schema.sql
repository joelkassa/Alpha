-- Admin user (single account)
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Generic editable content blocks (hero text, about text, etc.)
CREATE TABLE content_blocks (
  id SERIAL PRIMARY KEY,
  block_key VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'home_hero_title'
  block_value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Programs
CREATE TABLE programs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Gallery images (linked loosely to programs)
CREATE TABLE gallery_images (
  id SERIAL PRIMARY KEY,
  program_id INTEGER REFERENCES programs(id) ON DELETE SET NULL,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Staff
CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  bio TEXT,
  photo_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stats (e.g. "Students Enrolled: 250")
CREATE TABLE stats (
  id SERIAL PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  value VARCHAR(50) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Donor logos
CREATE TABLE donor_logos (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  logo_url VARCHAR(500) NOT NULL,
  link_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Donations (records, not payment secrets)
CREATE TABLE donations (
  id SERIAL PRIMARY KEY,
  donor_name VARCHAR(255),
  amount NUMERIC(12, 2) NOT NULL,
  method VARCHAR(50) NOT NULL, -- 'telebirr' or 'cbe'
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
  transaction_ref VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- News / announcements (for future use)
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  image_url VARCHAR(500),
  published_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity log (for admin undo + audit trail)
CREATE TABLE activity_log (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
  table_name VARCHAR(100) NOT NULL,
  record_id INTEGER,
  previous_data JSONB, -- snapshot before change, used for undo
  new_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);