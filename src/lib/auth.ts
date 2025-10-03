import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import UserProfile from "@/models/UserProfile";
import dbConnect from "@/lib/dbConnect";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    role?: string;
    userId?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          hd: "gmail.com" // Restrict to Gmail accounts only
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      
      // Fetch user role from database on JWT creation/update
      if (token.email) {
        try {
          await dbConnect();
          const userProfile = await UserProfile.findOne({ email: token.email });
          if (userProfile) {
            token.role = userProfile.role;
            token.userId = (userProfile._id as any).toString();
          } else {
            token.role = 'employee';
          }
        } catch (error) {
          console.error('Error fetching user role in JWT:', error);
          token.role = 'employee';
        }
      }
      
      return token;
    },
    async session({ session, token, user }) {
      session.accessToken = token.accessToken as string;
      
      // Use role from token
      if (token.role) {
        session.user.role = token.role as string;
        session.user.id = token.userId as string;
      } else {
        session.user.role = 'employee';
      }
      
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
