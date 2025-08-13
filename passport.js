const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const mongoose = require('mongoose');

module.exports = function initPassport(){
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: process.env.JWT_SECRET
  };
  passport.use(new JwtStrategy(opts, async (payload, done)=>{
    try{
      const User = mongoose.model('users');
      const u = await User.findById(payload._id);
      if(u) return done(null, { _id: u._id.toString(), userName: u.userName });
      return done(null, false);
    }catch(err){ return done(err, false); }
  }));
  return passport;
};