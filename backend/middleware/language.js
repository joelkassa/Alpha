module.exports = function language(req, res, next) {
  const queryLang = req.query.lang;

  if (queryLang === 'en' || queryLang === 'am') {
    res.cookie('lang', queryLang, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: false,
    });
    req.lang = queryLang;
  } else {
    req.lang = req.cookies && req.cookies.lang === 'am' ? 'am' : 'en';
  }

  res.locals.lang = req.lang;
  next();
};