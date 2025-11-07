import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/usersModel.js";
import argon2 from "argon2";

passport.use(
  new LocalStrategy((username, password, done) => {
    void (async () => {
      try {
        const [user] = await User.getAuthUser(username);

        if (!user) {
          // user not found
          done(null, false, { message: "Incorrect Username" });
          return;
        }

        if (await argon2.verify(user.password, password)) done(null, user);
        else
          done(null, false, {
            message: "Incorrect Password",
          });
      } catch (err) {
        done(err);
      }
    })();
  }),
);

passport.serializeUser((user, done) => {
  done(null, (user as User).u_id);
});

passport.deserializeUser((user: number, done) => {
  void (async () => {
    try {
      const [userObj] = await User.get({ u_id: user });

      if (!userObj)
        // missing user
        done(null, false);
      else done(null, userObj);
    } catch (err) {
      done(err);
    }
  })();
});
