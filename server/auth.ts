import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import express, { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from 'fs';

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

  app.get("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const [userProfile] = await storage.getUserProfile(req.user.id);
      res.json(userProfile || null);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

  app.put("/api/user/profile", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      console.log('Update Profile Request:', {
        userId: req.user.id,
        body: req.body
      });

      const [updatedUser, updatedProfile] = await storage.updateUser(req.user.id, {
        username: req.body.username,
        name: req.body.name,
        email: req.body.email
      },{
        bio: req.body.bio,
        dob: req.body.dob,
        gender: req.body.gender,
        imageUrl: req.body.imageUrl,
        address: req.body.address,
        city: req.body.city,
        country: req.body.country,
        postalCode: req.body.postalCode,
        phoneNumber: req.body.phoneNumber,
        socialMedia: req.body.socialMedia,
        occupation: req.body.occupation,
      });
      console.log('Update Results:', {
        user: updatedUser,
        profile: updatedProfile
      });
      if (!updatedUser) {
        console.error('User update failed');
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user: updatedUser, profile: updatedProfile });
    } catch (err) {
      next(err);
    }
  });

const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/upload", upload.single('file'), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const file_location = req.body.file_location || '';
    const uploadPath = path.join(process.env.FILE_UPLOADER_PATH || '', file_location);

    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Define the final file path
    const filename = (Date.now() + '-' + Math.round(Math.random() * 1E9)) + path.extname(file.originalname);
    const filePath = path.join(uploadPath, `${filename}`);
    const fileURLPath = path.join(process.env.SERVER_UPLOAD_PATH || '', `/${file_location}/` ,`${filename}`);

    // Write the file from memory to disk
    fs.writeFileSync(filePath, file.buffer);

    res.json({ message: "File uploaded successfully!", url: fileURLPath });
  } catch (error) {
      res.status(500).json({ error: "File upload failed", details: (error as Error).message });
  }
});

// Update static file serving
app.use(`${process.env.SERVER_UPLOAD_PATH}`, express.static(`${process.env.FILE_UPLOADER_PATH}`));
// Example
// FILE_UPLOADER_PATH="e:/xampp8-0/htdocs/EventMarketplace/client/.next/server/uploads"
// SERVER_UPLOAD_PATH="/_next/server/uploads/"
}