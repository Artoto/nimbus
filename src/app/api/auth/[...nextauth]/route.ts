import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getGristRecords, User_management } from "@/lib/grist";
import { cookies } from "next/headers";

const tableName = "User_management"; //ชื่อตาราง
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
          prompt: "select_account", // เพิ่มพารามิเตอร์นี้
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
        cookies().set("user_email", user?.email, {
          httpOnly: true, // คุกกี้ไม่สามารถเข้าถึงได้จาก JavaScript ฝั่ง client
          // secure: process.env.NODE_ENV === "production", // ใช้ HTTPS เท่านั้นใน production
          maxAge: 60 * 60 * 24 * 7, // 1 สัปดาห์ (วินาที)
          path: "/", // คุกกี้สามารถใช้ได้กับทุก path
          sameSite: "lax", // ป้องกัน CSRF ในระดับหนึ่ง
        });

        try {
          const User_management: Usermanagement[] =
            await getGristRecords<User_management>(tableName, filter);

          if (User_management.length > 0) {
            // พบผู้ใช้ใน Grist
            token.gristBuyer = User_management[0].buyer; // เพิ่ม 'um_buyer' เข้าไปใน token
            token.gristName = User_management[0].um_name; // เพิ่มข้อมูลอื่นๆ ที่ต้องการ
            cookies().set("buyer", User_management[0].buyer, {
              httpOnly: true, // คุกกี้ไม่สามารถเข้าถึงได้จาก JavaScript ฝั่ง client
              // secure: process.env.NODE_ENV === "production", // ใช้ HTTPS เท่านั้นใน production
              maxAge: 60 * 60 * 24 * 7, // 1 สัปดาห์ (วินาที)
              path: "/", // คุกกี้สามารถใช้ได้กับทุก path
              sameSite: "lax", // ป้องกัน CSRF ในระดับหนึ่ง
            });
          } else {
            token.gristBuyer = null; // หรือค่า default
            token.gristName = user.name;
          }
        } catch (error) {
          token.gristBuyer = null;
        }
      }
      return token; // ส่ง token กลับไป
    },
    session: async ({ session, token }) => {
      if (token.gristBuyer) {
        session.user.buyer = token.gristBuyer;
      }
      if (token.gristName) {
        session.user.gristName = token.gristName; // ตัวอย่างการเพิ่มชื่อจาก Grist
      }
      return session;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/profile`;
    },
    async signIn({ user, account, profile }) {
      return true; // Return true เพื่ออนุญาตให้ login ต่อไป
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
