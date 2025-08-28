exports.isAuth = (req, res, next) => {
  if (req.session?.userId) return next();
  return res.redirect('/login');
};

exports.allowUsers = (req, res, next) => {
  if (!req.session?.userId) return res.redirect('/login');
  if (['user','admin'].includes(req.session.role)) return next();
  return res.redirect('/login');
};
