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
          let userProfile = await UserProfile.findOne({ email: token.email });
          
          if (!userProfile) {
            // Create user profile automatically for new users
            const nameParts = token.name?.split(' ') || ['', ''];
            // Set prashantworkoffice@gmail.com as manager, others as employee
            const userRole = token.email === 'prashantworkoffice@gmail.com' ? 'manager' : 'employee';
            
            userProfile = new UserProfile({
              userId: token.email,
              email: token.email,
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || '',
              role: userRole,
              leaveBalance: {
                sick: 10,
                vacation: 20,
                personal: 5,
                workFromHome: 12,
                emergency: 3
              }
            });
            await userProfile.save();
          }
          
          token.role = userProfile.role;
          token.userId = (userProfile._id as any).toString();
        } catch (error) {
          console.error('Error fetching/creating user profile in JWT:', error);
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
