const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  handler: (req, res) => {
    res.status(429).render('admin/login', {
      error: 'Too many login attempts. Please wait 15 minutes and try again.',
      email: req.body.email || '',
    });
  },
});