module.exports = {
    // This method to protedted rutes if dont is logged
    isLoggedIn(req, res, next) {
        if(req.isAuthenticated()){

            return next();
        }
        return res.redirect('/signin');
    },

    isNotLoggedIn(req, res, next) {
        if(!req.isAuthenticated()){
            return next();
        }
        return res.redirect('/profile');
    }

}