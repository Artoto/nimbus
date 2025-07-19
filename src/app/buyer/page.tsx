"use server";
import { getGristRecords, Order } from "@/lib/grist";
import ManageOrder from "@/compornent/manageOrder";
import "../style/profile.css";
import { cookies } from "next/headers";

export default async function Buyer() {
  const cookieStore = cookies();
  const userEmail = cookieStore.get("user_email")?.value || "";
  const tableName = "Order"; //ชื่อตาราง
  let filter = ""; // filter
  if (userEmail) {
    filter = encodeURIComponent(JSON.stringify({ buyer_list: [userEmail] }));
  }
  const orders = await getGristRecords<Order>(tableName, filter);

  return (
    <>
      <ManageOrder orders={orders} role="buyer" />
    </>
  );
}
