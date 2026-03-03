// __mocks__/auth.js
module.exports = {
  isLoggedIn: (req, res, next) => next(),
  isNotLoggedIn: (req, res, next) => next(),
  isNotLoggedInApi: (req, res, next) => next()
};
