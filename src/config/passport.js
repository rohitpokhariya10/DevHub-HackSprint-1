const passport = require("passport");
const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (refreshToken, accesToken, profile, cb) => {
      try {
        console.log("profile-->", profile);
        let name = profile.displayName;
        let email = profile.emails[0].value;
        let avatar = profile.photos[0].value;
        let authProvider = profile.provider;
        let isEmailVerified = profile.emails[0].verified;
        let googleId = profile.id;

        if (!email) {
          throw new ApiError(400, "Google account email not found");
        }

        let user = await User.findOne({ googleId });

        if (!user) {
          //check user is available on the basis of their email
          user = await User.findOne({ email });
          if (user) {
            //agar user email registered hai it means user sigin with google s e nhi hua tabhi ye bhi properties add krenge db me
            user.googleId = googleId;
            user.isEmailVerified = isEmailVerified;
            user.avatar = avatar;
            user.authProvider = authProvider;
          } else {
            //agar juser ne na google se sign in kra na normal register tab user create hoga
            user = await User.create({
              name,
              email,
              googleId,
              avatar,
              authProvider: "google",
              isEmailVerified: true,
            });
          }
        }
        cb(null, user); //ye passport ab ise req.user me add krdega
      } catch (error) {
        console.error("Error in passwort.js", error);
      }
    },
  ),
);

module.exports = passport;
