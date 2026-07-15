const db = require('../config/db');
const { getProvider } = require('../services/payments');

const PRESET_AMOUNTS = [100, 200, 500, 1000];

exports.getDonate = async (req, res, next) => {
  try {
    const lang = req.lang;

    const contentResult = await db.query(
      `SELECT block_key, block_value_en, block_value_am
       FROM content_blocks
       WHERE block_key IN ('donate_hero_title','donate_hero_subtitle','donate_note')`
    );
    const content = {};
    contentResult.rows.forEach((row) => {
      content[row.block_key] = lang === 'am' ? row.block_value_am : row.block_value_en;
    });

    res.render('donate', {
      title: lang === 'am' ? 'ለግሱ — አልፋ ትምህርት ቤት' : 'Donate — Alpha School',
      content,
      presetAmounts: PRESET_AMOUNTS,
      activePage: 'donate',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

exports.postInitiate = async (req, res, next) => {
  try {
    const lang = req.lang;
    const { amount, method, donor_name } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.render('donate', {
        title: lang === 'am' ? 'ለግሱ — አልፋ ትምህርት ቤት' : 'Donate — Alpha School',
        content: {},
        presetAmounts: PRESET_AMOUNTS,
        activePage: 'donate',
        error: lang === 'am' ? 'እባክዎ ትክክለኛ መጠን ያስገቡ' : 'Please enter a valid amount.',
      });
    }

    if (method !== 'telebirr' && method !== 'cbe') {
      return res.status(400).send('Invalid payment method');
    }

    const insertResult = await db.query(
      `INSERT INTO donations (donor_name, amount, method, status)
       VALUES ($1, $2, $3, 'pending') RETURNING id`,
      [donor_name || null, numericAmount, method]
    );
    const donationId = insertResult.rows[0].id;

    const provider = getProvider(method);
    const { redirectUrl } = await provider.initiate({ id: donationId, amount: numericAmount });

    res.redirect(redirectUrl);
  } catch (err) {
    next(err);
  }
};

exports.getSandboxProcessing = (req, res) => {
  const { donationId, method } = req.query;
  res.render('donate-processing', {
    title: 'Processing Donation',
    donationId,
    method,
    lang: req.lang,
  });
};

exports.getComplete = async (req, res, next) => {
  try {
    const lang = req.lang;
    const { donationId } = req.query;
    const MODE = process.env.PAYMENT_MODE || 'sandbox';

    const donationResult = await db.query(`SELECT * FROM donations WHERE id = $1`, [donationId]);
    const donation = donationResult.rows[0];

    if (!donation) {
      return res.status(404).send('Donation not found');
    }

    if (MODE === 'sandbox' && donation.status === 'pending') {
      const provider = getProvider(donation.method);
      const result = await provider.verifyCallback({ donationId });

      await db.query(
        `UPDATE donations SET status = $1, transaction_ref = $2 WHERE id = $3`,
        [result.success ? 'completed' : 'failed', result.transactionRef || null, donationId]
      );
      donation.status = result.success ? 'completed' : 'failed';
    }

    const contentResult = await db.query(
      `SELECT block_key, block_value_en, block_value_am
       FROM content_blocks
       WHERE block_key IN ('donate_thankyou_title','donate_thankyou_message')`
    );
    const content = {};
    contentResult.rows.forEach((row) => {
      content[row.block_key] = lang === 'am' ? row.block_value_am : row.block_value_en;
    });

    res.render('donate-complete', {
      title: lang === 'am' ? 'እናመሰግናለን' : 'Thank You',
      content,
      donation,
      activePage: 'donate',
    });
  } catch (err) {
    next(err);
  }
};

// Real webhook endpoint — Telebirr/CBE will call this directly in production.
// Not used by the sandbox flow above, but fully wired for when live credentials arrive.
exports.postCallback = async (req, res) => {
  try {
    const { method, donationId } = req.body;
    const provider = getProvider(method);
    const result = await provider.verifyCallback(req.body);

    await db.query(
      `UPDATE donations SET status = $1, transaction_ref = $2 WHERE id = $3`,
      [result.success ? 'completed' : 'failed', result.transactionRef || null, donationId]
    );

    res.status(200).send('OK');
  } catch (err) {
    console.error('Payment callback error:', err.message);
    res.status(500).send('Callback processing failed');
  }
};