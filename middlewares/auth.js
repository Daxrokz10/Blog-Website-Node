exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

exports.allowUsers = (req, res, next) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  if (['user','admin'].includes(req.user.role)) return next();
  res.redirect('/login');
};
