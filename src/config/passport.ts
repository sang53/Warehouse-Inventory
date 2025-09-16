import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/usersModel.ts";
import argon2 from "argon2";

passport.use(
  new LocalStrategy((username, password, done) => {
    void (async () => {
      try {
        const user = await User.getAuthUser(username);
        if (!(await argon2.verify(user.password, password)))
          done(null, false, { message: "Incorrect Username or Password" });
        else done(null, user);
      } catch (error) {
        done(error);
      }
    });
  }),
);

passport.serializeUser((user, done) => {
  done(null, (user as User).u_id);
});

passport.deserializeUser((u_id: number, done) => {
  void (async () => {
    try {
      const user = await User.get({ u_id });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
});
