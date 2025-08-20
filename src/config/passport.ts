import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User, { VerifyUser } from "../models/usersModel.ts";
import argon2 from "argon2";

passport.use(
  new LocalStrategy((username, password, done) => {
    void (async () => {
      try {
        const user = await VerifyUser.getByUsername(username);
        if (!user.password || !(await argon2.verify(user.password, password)))
          done(null, false, { message: "Incorrect Username or Password" });
        else done(null, user);
      } catch (error) {
        done(error);
      }
    });
  }),
);

passport.serializeUser((user, done) => {
  done(null, (user as VerifyUser).u_id);
});

passport.deserializeUser((id: number, done) => {
  void (async () => {
    try {
      const user = await User.get(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
});
