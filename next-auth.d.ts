import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

// Rozszerzamy Session
declare module "next-auth" {
  interface Session {
    uid?: string; // <-- dodajemy własne pole
    isAdmin?: boolean;
  }

  interface User {
    id: string; // jeśli potrzebujesz id w userze
    isAdmin?: boolean;
  }
}

// Jeśli używasz JWT
declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    isAdmin?: boolean;
  }
}
