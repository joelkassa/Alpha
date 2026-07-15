const db = require('../config/db');
const { logChange } = require('../utils/activityLog');

function createListController({ table, columns }) {
  return {
    async create(req, res) {
      try {
        const values = columns.map((col) => req.body[col] ?? null);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const result = await db.query(
          `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
          values
        );
        const newRow = result.rows[0];

        await logChange(req.session.adminId, 'create', table, newRow.id, null, newRow);

        res.json({ success: true, row: newRow });
      } catch (err) {
        console.error(`${table} create error:`, err.message);
        res.status(500).json({ error: 'Failed to create item' });
      }
    },

    async update(req, res) {
      try {
        const { id } = req.params;
        const existing = await db.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
        if (existing.rows.length === 0) {
          return res.status(404).json({ error: 'Not found' });
        }
        const previousRow = existing.rows[0];

        const setClauses = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
        const values = columns.map((col) => (req.body[col] !== undefined ? req.body[col] : previousRow[col]));
        values.push(id);

        const result = await db.query(
          `UPDATE ${table} SET ${setClauses} WHERE id = $${columns.length + 1} RETURNING *`,
          values
        );

        await logChange(req.session.adminId, 'update', table, id, previousRow, result.rows[0]);

        res.json({ success: true, row: result.rows[0] });
      } catch (err) {
        console.error(`${table} update error:`, err.message);
        res.status(500).json({ error: 'Failed to update item' });
      }
    },

    async remove(req, res) {
      try {
        const { id } = req.params;
        const existing = await db.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
        if (existing.rows.length === 0) {
          return res.status(404).json({ error: 'Not found' });
        }
        const previousRow = existing.rows[0];

        await db.query(`DELETE FROM ${table} WHERE id = $1`, [id]);

        await logChange(req.session.adminId, 'delete', table, id, previousRow, null);

        res.json({ success: true });
      } catch (err) {
        console.error(`${table} delete error:`, err.message);
        res.status(500).json({ error: 'Failed to delete item' });
      }
    },
  };
}

module.exports = createListController;