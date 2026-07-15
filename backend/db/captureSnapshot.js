require('dotenv').config();
const db = require('../config/db');

const EDITABLE_TABLES = ['content_blocks', 'stats', 'programs', 'gallery_images', 'staff', 'donor_logos'];

async function captureSnapshot() {
  for (const table of EDITABLE_TABLES) {
    const result = await db.query(`SELECT * FROM ${table}`);
    await db.query(
      `INSERT INTO default_snapshots (table_name, snapshot_data)
       VALUES ($1, $2)
       ON CONFLICT (table_name) DO UPDATE SET snapshot_data = $2, captured_at = NOW()`,
      [table, JSON.stringify(result.rows)]
    );
    console.log(`Captured snapshot for ${table} (${result.rows.length} rows)`);
  }
  process.exit(0);
}

captureSnapshot();