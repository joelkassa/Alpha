const { doubleCsrf } = require('csrf-csrf');

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => process.env.SESSION_SECRET,
  getSessionIdentifier: (req) => req.session.id,
  cookieName: 'csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  },
  size: 64,
  getCsrfTokenFromRequest: (req) => req.body._csrf || req.headers['x-csrf-token'],
});

module.exports = { doubleCsrfProtection, generateCsrfToken };