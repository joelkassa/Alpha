const MODE = process.env.PAYMENT_MODE || 'sandbox';

async function initiate(donation) {
  if (MODE === 'sandbox') {
    return {
      redirectUrl: `/donate/sandbox-processing?donationId=${donation.id}&method=cbe`,
    };
  }

  // ──────────────────────────────────────────────────────────
  // REAL CBE BIRR INTEGRATION — fill in once credentials arrive
  // ──────────────────────────────────────────────────────────
  // 1. Build the request using:
  //      process.env.CBE_MERCHANT_ID
  //      process.env.CBE_API_KEY
  // 2. POST to `${process.env.CBE_BASE_URL}/payment/initiate`
  //    with donation.amount, donation.id, and a callback URL
  //    pointing to POST /donate/callback
  // 3. Return { redirectUrl: <payment URL from CBE's response> }
  throw new Error('CBE live integration not yet configured.');
}

async function verifyCallback(payload) {
  if (MODE === 'sandbox') {
    return { success: true, transactionRef: `SANDBOX-CBE-${Date.now()}` };
  }

  // ──────────────────────────────────────────────────────────
  // REAL CBE CALLBACK VERIFICATION — fill in later
  // ──────────────────────────────────────────────────────────
  throw new Error('CBE live callback verification not yet configured.');
}

module.exports = { initiate, verifyCallback };