const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'class manager secret', async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login');
      } else {
        console.log(decodedToken);
        let user = await User.findById(decodedToken.id);
        if(user.role != "teacher")
            res.redirect('/login');
        next();
      }
    });
  } else {
    res.redirect('/login');
  }
};

// check current user
const checkUser = (req, res, next) => {
    console.log("user Checked: " );
   
    const token = req.cookies.jwt;
    if (token) {
      jwt.verify(token, 'class manager secret', async (err, decodedToken) => {
        if (err) {
          res.locals.user = null;
          next();
        } else {
          let user = await User.findById(decodedToken.id);
          res.locals.user = user;
          
          next();
        }
      });
    } else {
      res.locals.user = null;
      next();
    }
  };

module.exports = { requireAuth, checkUser };