module.exports.isAdmin  = function(request, response, next) {
    if (request.session.admin) {
        return next();
    } else {

        response.redirect('/admin/invalid-login');
    }
}