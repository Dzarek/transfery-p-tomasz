import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    uid: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    uid: string;
  }
}
