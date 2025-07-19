"use server";
import { getGristRecords, addGristRecord, User_management } from "@/lib/grist";

interface SearchUserState {
  message: string;
  // อาจจะมีอย่างอื่นเพิ่มได้ เช่น foundUser: User_management | null;
}

export async function searchUser(
  prevState: SearchUserState | undefined,
  formData: FormData
) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[A-Za-z0-9\-_.]+$/;
  const enPattern = /^[A-Za-z0-9\s/!@#$%^&*(),.\-_?":{}|<>]*$/;
  const buyer = formData.get("buyer");
  const email = formData.get("email");
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
    return { message: "success" };
  } catch (error) {
    return { message: "Error" };
  }
}
