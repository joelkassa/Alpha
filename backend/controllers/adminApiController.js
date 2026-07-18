const db = require('../config/db');
const { logChange } = require('../utils/activityLog');

// Update a single content_blocks row (identified by block_key)
exports.patchContentBlock = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, lang } = req.body;

    if (!['en', 'am'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid lang' });
    }

    const column = lang === 'am' ? 'block_value_am' : 'block_value_en';

    const existing = await db.query(`SELECT * FROM content_blocks WHERE block_key = $1`, [key]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Content block not found' });
    }
    const previousRow = existing.rows[0];

    const updated = await db.query(
      `UPDATE content_blocks SET ${column} = $1, updated_at = NOW() WHERE block_key = $2 RETURNING *`,
      [value, key]
    );

    await logChange(
      req.session.adminId,
      'update',
      'content_blocks',
      previousRow.id,
      previousRow,
      updated.rows[0]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('patchContentBlock error:', err.message);
    res.status(500).json({ error: 'Failed to save change' });
  }
};

// Undo the most recent change, regardless of which table or action type it was
exports.postUndo = async (req, res) => {
  try {
    const lastChange = await db.query(
      `SELECT * FROM activity_log WHERE reverted = FALSE ORDER BY created_at DESC LIMIT 1`
    );

    if (lastChange.rows.length === 0) {
      return res.status(400).json({ error: 'Nothing to undo' });
    }

    const entry = lastChange.rows[0];
    const { table_name, action, previous_data, new_data } = entry;

    if (action === 'update') {
      const row = previous_data;
      const columns = Object.keys(row).filter((c) => c !== 'id');
      const setClauses = columns.map((c, i) => `${c} = $${i + 1}`).join(', ');
      const values = columns.map((c) => row[c]);
      values.push(row.id);
      await db.query(`UPDATE ${table_name} SET ${setClauses} WHERE id = $${columns.length + 1}`, values);
    } else if (action === 'reorder') {
      for (const row of previous_data) {
        await db.query(`UPDATE ${table_name} SET sort_order = $1 WHERE id = $2`, [row.sort_order, row.id]);
      }
    } else if (action === 'create') {
      await db.query(`DELETE FROM ${table_name} WHERE id = $1`, [new_data.id]);
    } else if (action === 'delete') {
      const row = previous_data;
      const columns = Object.keys(row);
      const values = Object.values(row);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      await db.query(`INSERT INTO ${table_name} (${columns.join(', ')}) VALUES (${placeholders})`, values);
    }

    await db.query(`UPDATE activity_log SET reverted = TRUE WHERE id = $1`, [entry.id]);

    res.json({ success: true, undone: table_name });
  } catch (err) {
    console.error('postUndo error:', err.message);
    res.status(500).json({ error: 'Failed to undo' });
  }
};

// Reset all editable content back to the captured default snapshot
exports.postReset = async (req, res) => {
  try {
    const { confirmText } = req.body;
    if (confirmText !== 'RESET') {
      return res.status(400).json({ error: 'Confirmation text did not match' });
    }

    const snapshots = await db.query(`SELECT * FROM default_snapshots`);

    for (const snap of snapshots.rows) {
      const table = snap.table_name;
      const rows = snap.snapshot_data;

      await db.query(`TRUNCATE ${table} RESTART IDENTITY CASCADE`);

      for (const row of rows) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        await db.query(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`, values);
      }
    }

    await db.query(`DELETE FROM activity_log`);

    res.json({ success: true });
  } catch (err) {
    console.error('postReset error:', err.message);
    res.status(500).json({ error: 'Failed to reset' });
  }
};