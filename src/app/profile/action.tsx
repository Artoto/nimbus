"use server";
import { getGristRecords, addGristRecord, User_management } from "@/lib/grist";
import { cookies } from "next/headers";

interface SearchUserState {
  message: string;
  data?: string;
  // อาจจะมีอย่างอื่นเพิ่มได้ เช่น foundUser: User_management | null;
}

interface fromProps {
  name: string;
  email: string;
  image: string;
  buyer: string;
  gristName: string;
}

export async function searchUser(
  formData: fromProps
): Promise<SearchUserState> {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[A-Za-z0-9\-_.]+$/;
  const enPattern = /^[A-Za-z0-9\s/!@#$%^&*(),.\-_?":{}|<>]*$/;
  const buyer = formData.buyer;
  const email = formData.email;
  const cookieStore = cookies();

  if (!buyer) {
    return { message: "invalldate value" };
  }
  if (
    !enPattern.test(buyer.toString()) ||
    !emailPattern.test(buyer.toString())
  ) {
    return { message: "invalldate value" };
  }

  try {
    const tableName = "User_management"; //ชื่อตาราง
    const filter = encodeURIComponent(`{"um_email": ["${buyer}"]}`);
    const User_management = await getGristRecords<User_management>(
      tableName,
      filter
    );
    if (User_management.length === 0) {
      return { message: "User not foun" };
    }

    cookieStore.set("buyer", buyer.toString(), {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax",
    });
    const records = JSON.stringify({
      records: [
        {
          require: {
            um_email: email,
          },
          fields: {
            buyer: buyer,
          },
        },
      ],
    });

    const updateUserBuyer = await addGristRecord<User_management>(
      tableName,
      records
    );
    if (updateUserBuyer) {
      return { message: "Error" };
    }
    return { message: "success", data: buyer.toString() };
  } catch (error) {
    return { message: "Error" };
  }
}
