import { NextAuthOptions } from "next-auth";
import { getFeideData } from "@/services/webService";
import GoogleProvider from "next-auth/providers/google";
import { Actions, FeideProfile } from "../constants/interface";
import connectToDB from "./db";
import { Usersession } from "@/models/userdetails";
import Metric from "@/models/metrices.models";

type GoogleProfile = {
  email: string;
  email_verified: boolean;
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    {
      id: "feide",
      name: "Feide",
      type: "oauth",
      issuer: process.env.FEIDE_ISSUER!,
      clientId: process.env.FEIDE_CLIENT_ID!,
      clientSecret: process.env.FEIDE_CLIENT_SECRET!,
      wellKnown: `${process.env
        .FEIDE_ISSUER!}/.well-known/openid-configuration`,
      authorization: {
        params: {
          prompt: "login",
          // response_mode: "fragment",
        },
      },
      idToken: true,
      profile(profile: FeideProfile) {
        return {
          id: profile.sub ?? "",
          name: profile.name ?? "User",
          email: profile.email ?? "",
        };
      },
    },
  ],

  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === "google" && profile?.email) {
        const googleProfile = profile as GoogleProfile;

        // Check if this is an admin login attempt (coming from admin-login page)
        const isAdminLogin =
          account.callbackUrl &&
          typeof account.callbackUrl === "string" &&
          account.callbackUrl.includes("/admin");

        if (isAdminLogin) {
          // For admin login, only allow @indeva.co.in emails
          const allowedDomains = ["@indeva.co.in"];
          return (
            googleProfile.email_verified &&
            allowedDomains.some((domain) =>
              googleProfile.email.endsWith(domain)
            )
          );
        }

        return googleProfile.email_verified;
      }

      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      if (user && account?.access_token) {
        if (account.provider === "feide") {
          try {
            // Determine user role based on scope
            const userRole = account?.scope?.includes("groups-memberids")
              ? "teacher"
              : account?.scope?.includes("gk_guardianapi")
              ? "guardian"
              : "learner";

            const feideData = await getFeideData(account.access_token);
            const data = feideData.data;

            // Operations (Payment Metric)
            try {
              await connectToDB();
              const existingUserMetric = await Metric.findOne({
                userId: data.userInfo.feideId,
              });
              if (existingUserMetric) {
                const loginAction = existingUserMetric.actions.find(
                  (a: Actions) => a.name === "login"
                );
                if (loginAction && loginAction.value > 0) {
                  loginAction.value += 1;
                  loginAction.timestamps.push(new Date());
                } else {
                  existingUserMetric.actions.push({
                    name: "login",
                    value: 1,
                    timestamps: [new Date()],
                  });
                }
                await existingUserMetric.save();
              } else {
                await Metric.create({
                  userId: data.userInfo.feideId,
                  orgId: data.organizationInfo.mainOrgId,
                  orgName: data.organizationInfo.mainOrgName,
                  orgNIN: data.organizationInfo.orgNIN,
                  actions: [
                    {
                      name: "login",
                      value: 1,
                      timestamps: [new Date()],
                    },
                  ],
                });
              }
            } catch (error) {
              console.error("Error updating login count in metric:", error);
            }

            const finalUser = {
              ...user,
              ...feideData.data,
              accessToken: account.access_token,
              userinfoNIN: {
                name: feideData.data.userInfo.name,
                userid_nin: feideData.data.userInfo.userid_nin,
                "https://n.feide.no/claims/userid_sec": [
                  feideData.data.userInfo.feideId,
                ],
              },
              user_role: userRole,
              provider: "feide",
            };
            if (account.id_token) {
              token.idToken = account.id_token;
            }

            return {
              ...token,
              ...finalUser,
            };
          } catch (error) {
            console.error("Error fetching Feide data:", error);
            return {
              ...token,
              ...user,
              accessToken: account.access_token,
              user_role: "learner", // Default role on error
              provider: "feide",
            };
          }
        } else if (account.provider === "google") {
          const isAdmin = user.email && user.email.endsWith("@indeva.co.in");

          return {
            ...token,
            ...user,
            accessToken: account.access_token,
            provider: "google",
            user_role: isAdmin ? "admin" : "",
          };
        }
      }

      // Handle session update trigger
      if (trigger === "update" && session) {
        return { ...token, ...session?.user };
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          ...session?.user,
          user_role: token.user_role as string,
          userinfoNIN: token.userId_nin as string,
        };

        if (token.accessToken)
          session.accessToken = token.accessToken as string;
        if (token.provider) session.provider = token.provider as string;
        if (token.idToken) session.idToken = token.idToken as string;

        if (token.userInfo) {
          session.user.userInfo = token.userInfo;
        }
        if (token.organizationInfo) {
          session.user.organizationInfo = token.organizationInfo;
        }
      }

      // keep your DB save logic
      try {
        const isGoogleUser =
          token?.provider === "google" ||
          (token?.email && token.email.endsWith("@indeva.co.in"));

        if (!isGoogleUser && token && token.id && token.accessToken) {
          await connectToDB();
          try {
            const { data } = await getFeideData(token.accessToken);

            const userSessionPayload = {
              userId: data.userInfo.feideId,
              name: data.userInfo.name,
            };

            await Usersession.findOneAndUpdate(
              { userId: data.userInfo.feideId },
              userSessionPayload,
              { upsert: true, new: true }
            );
          } catch (feideError) {
            console.warn(
              "Could not fetch Feide data for session save:",
              feideError
            );
          }
        }
      } catch (err) {
        console.error("Session DB error:", err);
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  events: {
    async signOut({ token }) {
      try {
        const isGoogleUser =
          token?.provider === "google" ||
          (token?.email && token.email.endsWith("@indeva.co.in"));

        if (!isGoogleUser && token?.accessToken) {
          await connectToDB();
          try {
            const { data } = await getFeideData(token.accessToken);
            await Usersession.findOneAndDelete({
              userId: data.userInfo.feideId,
            });
          } catch (feideError) {
            console.warn(
              "Could not fetch Feide data for session cleanup:",
              feideError
            );
          }
        }
      } catch (error) {
        console.error("Session DB error during signout:", error);
      }
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET!,
};
