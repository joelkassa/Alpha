require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../config/db');

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node db/createAdmin.js <email> <password>');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await db.query(
      `INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)`,
      [email, passwordHash]
    );
    console.log('Admin user created successfully:', email);
  } catch (err) {
    console.error('Failed to create admin:', err.message);
  } finally {
    process.exit(0);
  }
}

createAdmin();