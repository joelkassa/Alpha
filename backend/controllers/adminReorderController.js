const db = require('../config/db');
const { logChange } = require('../utils/activityLog');

function createReorderHandler(table) {
  return async function (req, res) {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        return res.status(400).json({ error: 'orderedIds must be a non-empty array' });
      }

      const existing = await db.query(
        `SELECT id, sort_order FROM ${table} WHERE id = ANY($1::int[])`,
        [orderedIds]
      );
      const previousOrder = existing.rows;

      for (let i = 0; i < orderedIds.length; i++) {
        await db.query(`UPDATE ${table} SET sort_order = $1 WHERE id = $2`, [i, orderedIds[i]]);
      }

      await logChange(
        req.session.adminId,
        'reorder',
        table,
        null,
        previousOrder,
        orderedIds.map((id, i) => ({ id, sort_order: i }))
      );

      res.json({ success: true });
    } catch (err) {
      console.error(`${table} reorder error:`, err.message);
      res.status(500).json({ error: 'Failed to reorder items' });
    }
  };
}

module.exports = createReorderHandler;