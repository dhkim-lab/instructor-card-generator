import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Restrict to @teamjcurve.com domain
      if (user.email?.endsWith("@teamjcurve.com")) {
        return true;
      }
      return false; // Denial
    },
    async session({ session, token }) {
      return session;
    },
  },
  pages: {
    signIn: "/", // Direct to dashboard where login button is
    error: "/auth/error",
  },
};
