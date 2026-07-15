const MODE = process.env.PAYMENT_MODE || 'sandbox';

async function initiate(donation) {
  if (MODE === 'sandbox') {
    return {
      redirectUrl: `/donate/sandbox-processing?donationId=${donation.id}&method=telebirr`,
    };
  }

  // ──────────────────────────────────────────────────────────
  // REAL TELEBIRR INTEGRATION — fill in once credentials arrive
  // ──────────────────────────────────────────────────────────
  // 1. Build the request payload using:
  //      process.env.TELEBIRR_APP_ID
  //      process.env.TELEBIRR_APP_SECRET
  //      process.env.TELEBIRR_MERCHANT_ID
  // 2. POST to `${process.env.TELEBIRR_BASE_URL}/payment/initiate`
  //    with donation.amount, donation.id as your outTradeNo,
  //    and a callback/notify URL pointing to POST /donate/callback
  // 3. Return { redirectUrl: <toPayUrl from Telebirr's response> }
  throw new Error('Telebirr live integration not yet configured.');
}

async function verifyCallback(payload) {
  if (MODE === 'sandbox') {
    return { success: true, transactionRef: `SANDBOX-TB-${Date.now()}` };
  }

  // ──────────────────────────────────────────────────────────
  // REAL TELEBIRR CALLBACK VERIFICATION — fill in later
  // ──────────────────────────────────────────────────────────
  // Verify the payload's signature using TELEBIRR_APP_SECRET,
  // then extract the transaction status/reference.
  throw new Error('Telebirr live callback verification not yet configured.');
}

module.exports = { initiate, verifyCallback };