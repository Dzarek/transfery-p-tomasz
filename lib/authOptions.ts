import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { adminAuth } from "@/firebase/firebaseAdmin";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        token: { label: "Firebase ID Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;

        const decoded = await adminAuth.verifyIdToken(credentials.token);

        return {
          id: decoded.uid,
          email: decoded.email,
          name: decoded.name,
          image: decoded.picture,
          isAdmin: decoded.uid === process.env.ADMIN_ID ? true : false,
        };
      },
    }),
  ],
  pages: {
    signIn: "/logowanie", // Custom sign-in page
    signOut: "/logowanie",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.uid) {
        session.uid = token.uid;
        session.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Set in .env.local
};
