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
  session: {
    strategy: "database",
    maxAge: 60 * 60 * 4, // 4 hours
  },
  providers,
  callbacks: {
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
    // For OAuth sign-ins, mark the email as verified so they can be treated as trusted.
    async signIn({ user, account }: { user?: AppUser | null; account?: { provider?: string } | null }) {
      if (!user?.id || !account?.provider || account.provider === "credentials") return;
      try {
        const db = await getDb();
        await db
          .collection("users")
          .updateOne({ _id: new ObjectId(user.id) }, { $set: { emailVerified: new Date(), updatedAt: new Date() } });
      } catch (err) {
        console.error("signIn event update emailVerified failed", err);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function getServerAuthSession() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getServerSession(authOptions as any);
}

