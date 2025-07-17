import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import express, { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, users } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from 'fs';
import { error } from "console";

declare global {
  namespace Express {
    interface User extends SelectUser { }
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
      // secure: process.env.COOKIE_SECURE === "true",
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
        if (user.status === "inactive") {
          return done(null, false, { message: "Account is inactive" });
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

  app.get("/api/check-email", async (req, res) => {
    // Email should be in query params for GET request
    const email = req.query.email as string;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const existingUser = await storage.getUserByUserEmail(email);
    if (existingUser) {
      return res.status(200).json({ exists: true });
    }
    return res.status(200).json({ exists: false });
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "User name exists" });
      }
  
      // Extract profile-related fields
      const { firstName, middleName, lastName, address, city, phoneNumber, birthDay, ...userData } = req.body;
      
      // Always set role to customer
      userData.role = "customer";
      
      // Create the user
      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password),
      });
  
      // Create profile with additional fields if needed
      if (user && user.id) {
        await storage.createOrUpdateProfile(user.id, {
          userId: user.id,
          // Combine name parts if needed
          firstName: firstName || "",
          middleName: middleName || "",
          lastName: lastName || "",
          bio: "",
          dob: birthDay || new Date().toISOString(),
          gender: "not_to_disclose",
          address: address || "",
          city: city || "",
          phoneNumber: phoneNumber || "",
        });
      }
  
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({
          message: info?.message || "Invalid credentials" 
         });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Session destruction failed" });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        return res.status(200).json({ message: "Logged out successfully" });
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

  //Need to update profile logic
  app.put("/api/user/profile", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      console.log('Update Profile Request:', {
        userId: req.user.id,
        body: req.body
      });

      const [updatedUser, updatedProfile] = await storage.updateUser(req.user.id, {
        username: req.body.username,
        // name: req.body.name,
        email: req.body.email
      }, {
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

  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") return res.sendStatus(401);
    const users = await storage.getUsers(req.user.id);
    res.json(users);
  });

  app.patch("/api/users/:id/role", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") return res.sendStatus(401);
    const user = await storage.updateUseRole(
      parseInt(req.params.id), 
      req.body.role as "admin" | "vendor" | "customer" | "organizer"
    );
  });

  app.patch("/api/users/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(401);
    }
    const user = await storage.updateUserStatus(
      parseInt(req.params.id),
      req.body.status as "active" | "inactive"
    );
    if (!user) return res.sendStatus(404);
    res.json(user);
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
      const fileURLPath = path.join(process.env.SERVER_UPLOAD_PATH || '', `/${file_location}/`, `${filename}`);

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