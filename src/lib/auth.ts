// src/lib/auth.ts
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getGristRecords, User_management } from "@/lib/grist";
import { cookies } from "next/headers";

interface Usermanagement {
  id: number;
  um_id: number;
  um_email: string;
  um_name: string;
  um_created_at: number;
  um_updated_at: number;
  buyer: string;
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth",
    signOut: "/",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.email) {
        const tableName = "User_management";
        const filter = encodeURIComponent(`{"um_email": ["${user.email}"]}`);

        const cookieStore = cookies();
        cookieStore.set("user_email", user.email, {
          httpOnly: true,
          // secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: "/",
          sameSite: "lax",
        });

        try {
          const userManagementData: Usermanagement[] =
            await getGristRecords<User_management>(tableName, filter);

          if (userManagementData.length > 0) {
            // Found user in Grist
            token.gristBuyer = userManagementData[0].buyer;
            token.gristName = userManagementData[0].um_name;

            cookieStore.set("buyer", userManagementData[0].buyer, {
              httpOnly: true,
              // secure: process.env.NODE_ENV === "production",
              maxAge: 60 * 60 * 24 * 7, // 1 week
              path: "/",
              sameSite: "lax",
            });
          } else {
            token.gristBuyer = null;
            token.gristName = user.name;
          }
        } catch (error) {
          console.error("Error fetching user from Grist:", error);
          token.gristBuyer = null;
          token.gristName = user.name;
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        let users: any = session.user;
        if (token.gristBuyer) {
          users.buyer = token.gristBuyer;
        }
        if (token.gristName) {
          users.gristName = token.gristName;
        }
        session.user = users;
      }
      return session;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/profile`;
    },
    async signIn({ user, account, profile }) {
      return true;
    },
  },
};
