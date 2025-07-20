"use server";
import { getGristRecords, Order } from "@/lib/grist";
import ManageOrder from "@/compornent/manageOrder";
import { cookies } from "next/headers";

export default async function Manage() {
  const cookieStore = cookies();
  const userEmail = cookieStore.get("user_email")?.value || "";
  const tableName = "Order"; //ชื่อตาราง
  let filter = ""; // filter
  if (userEmail) {
    filter = encodeURIComponent(JSON.stringify({ order_list: [userEmail] }));
  }
  const orders = await getGristRecords<Order>(tableName, filter);
  return (
    <>
      <ManageOrder orders={orders} />
    </>
  );
}
