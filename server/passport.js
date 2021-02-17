const passport = require('passport');
const User = require('./models/user');
const { ExtractJwt, Strategy: JWTStrategy } = require('passport-jwt');

const JWTConfig = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: 'jusang',
};

const JWTVerify = async (jwtPayload, done) => {
		  // payload의 id값으로 유저의 데이터 조회
    User.findOne({_id: jwtPayload.user._id}, function(err, user) {
        if (err) {
            console.log(err);
            return done(err, false);
        }
        if (user) {
            console.log('find user');
            return done(null, user);
        } else {
            console.log('cant find user');
            return done(null, false);
            // or you could create a new account
        }
    });
};

passport.use('jwt', new JWTStrategy(JWTConfig, JWTVerify));
passport.use('local', User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = passport;
