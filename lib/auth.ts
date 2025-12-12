import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { compare } from "bcryptjs";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import clientPromise from "./mongodb-adapter-client";
import { getDb } from "./db";
import { ObjectId } from "mongodb";
import { verifyTurnstileToken } from "./turnstile";

type AppUser = {
  id: string;
  role?: string;
};

// Single source of truth: Auth.js manages sessions (database strategy) and cookies.
// No custom session cookies are created anywhere else.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const providers: any[] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      identifier: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.identifier || !credentials?.password) return null;

      const turnstileCheck = await verifyTurnstileToken(
        (credentials as typeof credentials & { turnstileToken?: string }).turnstileToken,
      );
      if (!turnstileCheck.success) {
        throw new Error("Turnstile verification failed. Please retry.");
      }

      const { getDb } = await import("./db");
      const db = await getDb();
      const user = await db
        .collection("users")
        .findOne({ email: credentials.identifier.toLowerCase().trim() });
      if (!user || !user.passwordHash) return null;

      const isValid = await compare(credentials.password, user.passwordHash);
      if (!isValid) return null;

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name ?? user.email,
        role: user.role ?? "user",
      };
    },
  }),
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  }),
  GithubProvider({
    clientId: process.env.GITHUB_CLIENT_ID ?? "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
  }),
];

if (process.env.RESEND_SMTP_URL && process.env.RESEND_FROM_EMAIL) {
  providers.push(
    EmailProvider({
      server: process.env.RESEND_SMTP_URL,
      from: process.env.RESEND_FROM_EMAIL,
    }),
  );
}

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB,
  }),
  // Allow linking OAuth accounts to existing emails (e.g., credentials) to avoid OAuthAccountNotLinked errors.
  allowDangerousEmailAccountLinking: true,
  // Use JWT sessions to avoid DB session cookie edge cases during development.
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 4, // 4 hours
  },
  providers,
  callbacks: {
    // Link OAuth logins to existing users by email to avoid OAuthAccountNotLinked.
    async signIn({
      user,
      account,
      profile,
    }: {
      user: AppUser | null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      account?: any;
      profile?: { email?: string | null } | null;
    }) {
      if (account?.provider && account.provider !== "credentials" && profile?.email) {
        try {
          const db = await getDb();
          const email = profile.email.toLowerCase();
          const existing = await db.collection("users").findOne({ email });
          if (existing?._id) {
            const userId = existing._id.toString();
            (user as AppUser | null | undefined)!.id = userId;
            // Upsert the account record to ensure it links to the existing user.
            await db.collection("accounts").updateOne(
              { provider: account.provider, providerAccountId: account.providerAccountId },
              {
                $set: {
                  userId: existing._id,
                  type: account.type,
                  access_token: account.access_token,
                  id_token: account.id_token,
                  token_type: account.token_type,
                  scope: account.scope,
                  expires_at: account.expires_at,
                  refresh_token: account.refresh_token,
                  session_state: account.session_state,
                  updatedAt: new Date(),
                },
                $setOnInsert: { createdAt: new Date() },
              },
              { upsert: true },
            );
          }
        } catch (err) {
          console.error("signIn linking error", err);
        }
      }
      return true;
    },
    async session({
      session,
      user,
      token,
    }: {
      session: Session;
      user?: AppUser | null;
      token: JWT;
    }) {
      const sUser = session.user as Session["user"] & AppUser;
      // Prefer fresh lookup to avoid stale roles after promotion.
      try {
        const db = await getDb();
        const id = user?.id || token?.sub;
        if (id) {
          const dbUser = await db.collection("users").findOne({ _id: new ObjectId(id) });
          if (dbUser) {
            sUser.id = dbUser._id.toString();
            sUser.role = (dbUser as { role?: string }).role ?? "user";
            return session;
          }
        }
      } catch {
        // fallback to previous behavior
      }

      if (user?.id) {
        sUser.id = user.id;
        sUser.role = (user as AppUser).role ?? "user";
      } else if (token?.sub) {
        sUser.id = token.sub;
        sUser.role = (token as AppUser).role ?? "user";
      }
      return session;
    },
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: AppUser | null;
    }) {
      if (user?.id) {
        token.sub = user.id;
        (token as AppUser).role = (user as AppUser).role ?? "user";
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  events: {
    // On sign-in, for OAuth mark email verified, and send a one-time welcome email via Resend if not sent.
    async signIn({ user, account }: { user?: AppUser | null; account?: { provider?: string } | null }) {
      if (!user?.id) return;
      try {
        const db = await getDb();
        const userId = new ObjectId(user.id);
        const doc = await db.collection("users").findOne({ _id: userId });

        // Mark email verified for OAuth sign-ins.
        if (account?.provider && account.provider !== "credentials") {
          await db
            .collection("users")
            .updateOne(
              { _id: userId },
              { $set: { emailVerified: new Date(), updatedAt: new Date() } },
              { upsert: false },
            );
        }

        // One-time welcome email via Resend.
        const resendApiKey = process.env.RESEND_API_KEY;
        const resendFrom = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM;
        const email = (doc as { email?: string } | null)?.email;
        const alreadySent = (doc as { welcomeSent?: boolean } | null)?.welcomeSent;
        if (resendApiKey && resendFrom && email && !alreadySent) {
          try {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: resendFrom,
                to: email,
                subject: "Welcome to Ferrari",
                text: "Welcome to Ferrari! We’re excited to have you on board.",
              }),
            });
            await db
              .collection("users")
              .updateOne({ _id: userId }, { $set: { welcomeSent: true, updatedAt: new Date() } });
          } catch (err) {
            console.error("welcome email failed", err);
          }
        }
      } catch (err) {
        console.error("signIn event handling failed", err);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function getServerAuthSession() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getServerSession(authOptions as any);
}

