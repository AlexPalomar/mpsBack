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
    },

    isNotLoggedInApi(req, res, next) {
        if (!req.isAuthenticated()) return next();
        
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(403).json({ message: 'Ya autenticado' });
        }

        res.redirect('/profile');
        }


}