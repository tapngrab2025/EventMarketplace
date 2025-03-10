import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
  return salt + ":" + derivedKey.toString("hex"); // Using : as separator
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [salt, hashedPassword] = stored.split(":"); // Match the separator used in hashPassword
  const derivedKey = await scryptAsync(supplied, salt, 64) as Buffer;
  return hashedPassword === derivedKey.toString("hex"); // Compare hex strings instead of buffers
}

// Remove the duplicate comparePasswords function below

export const localStrategy = new LocalStrategy(async (username, password, done) => {
  try {
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return done(null, false, { message: "Invalid username or password" });
    }

    const isValid = await comparePasswords(password, user.password);
    if (!isValid) {
      return done(null, false, { message: "Invalid username or password" });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
});

// Remove the duplicate comparePasswords function here

export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set");
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return next(err);
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

    // Add new update profile endpoint
    app.put("/api/user/profile", async (req, res, next) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      try {
        const updatedUser = await storage.updateUser(req.user.id, {
          username: req.body.username,
          name: req.body.name,
          email: req.body.email,
          bio: req.body.bio,
          dob: req.body.dob,
          gender: req.body.gender,
          imageUrl: req.body.imageUrl,
          address: req.body.address,
          contact: req.body.contact,
          city: req.body.city,
          country: req.body.country,
          postalCode: req.body.postalCode,
          phoneNumber: req.body.phoneNumber,
          socialMedia: req.body.socialMedia,
          occupation: req.body.occupation,
        });
        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }
        res.json(updatedUser);
      } catch (err) {
        next(err);
      }
    });
}