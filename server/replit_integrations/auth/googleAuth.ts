import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";

export function getSession() {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        ttl: sessionTtl,
        tableName: "sessions",
    });
    return session({
        secret: process.env.SESSION_SECRET || "default_dev_secret",
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: sessionTtl,
        },
    });
}

// Helper to update session with user info
function updateUserSession(req: any, user: any) {
    // We can store essential user info in the session if needed
    // Passport automatically serializes the user, so this might be redundant 
    // depending on how serializeUser is implemented, but let's keep it consistent.
    // In this implementation, we'll just rely on passport's session.
}

async function upsertUser(profile: any) {
    // Google profile structure:
    // id, displayName, name { familyName, givenName }, photos [ { value } ], emails [ { value } ]
    const email = profile.emails?.[0]?.value;
    const photoUrl = profile.photos?.[0]?.value;

    // existing storage might expect fields differently
    await authStorage.upsertUser({
        id: profile.id, // Use Google ID as user ID
        email: email,
        firstName: profile.name?.givenName || "",
        lastName: profile.name?.familyName || "",
        profileImageUrl: photoUrl,
    });
}

export async function setupAuth(app: Express) {
    app.set("trust proxy", 1);
    app.use(getSession());
    app.use(passport.initialize());
    app.use(passport.session());

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.warn("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET. Google Auth will not work.");
        // Don't crash in dev if just testing UI, but warn heavily.
    }

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID || "",
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
                callbackURL: "/api/auth/google/callback",
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    await upsertUser(profile);
                    // Pass the profile (or looked-up user) to the session
                    // We'll stick to passing the minimal info needed
                    const user = {
                        id: profile.id,
                        email: profile.emails?.[0]?.value,
                        displayName: profile.displayName,
                        photo: profile.photos?.[0]?.value,
                        // Add a flag or check database here if we wanted to enforce onboarding immediately
                        // But we'll do it via a route check
                    };
                    done(null, user);
                } catch (error) {
                    done(error as Error, undefined);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user: any, done) => {
        done(null, user);
    });

    // Auth Routes
    app.get(
        "/api/login",
        passport.authenticate("google", { scope: ["profile", "email"] })
    );

    app.get(
        "/api/auth/google/callback",
        passport.authenticate("google", {
            failureRedirect: "/api/login",
        }),
        (req, res) => {
            // Successful authentication, redirect home.
            res.redirect("/");
        }
    );

    app.get("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            res.redirect("/");
        });
    });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
};
