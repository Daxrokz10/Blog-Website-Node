const flash = require('connect-flash');

module.exports.addFlash = (req, res, next) => {
    const error = req.flash('error');
    const success = req.flash('success');
    res.locals.flash = {
        error: error.length > 0 ? error[0] : null,
        success: success.length > 0 ? success[0] : null
    };
    next();
};