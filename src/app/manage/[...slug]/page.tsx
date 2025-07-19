import { getGristRecords, Table1, Order } from "@/lib/grist";
import OrderDetail from "@/compornent/OrderDetail"; // ตรวจสอบ path ให้ถูกต้อง
import "../../style/profile.css";
import { cookies } from "next/headers";

interface ManageDetailPageProps {
  params: {
    slug: string[];
  };
}

export default async function ManageDetail({ params }: ManageDetailPageProps) {
  const orderSlug = params.slug?.[0]; // ใช้ Optional Chaining และเข้าถึง element แรก
  const cookieStore = cookies();
  const userEmail = cookieStore.get("user_email")?.value || "";
  const tableName1 = "Table1"; // ชื่อตาราง
  const tableName2 = "Order"; // ชื่อตาราง
  let filter = ""; // filter
  let filter2 = ""; // filter

  if (orderSlug) {
    filter = encodeURIComponent(JSON.stringify({ order_id: [orderSlug] }));
  }
  if (orderSlug) {
    filter2 = encodeURIComponent(
      JSON.stringify({ order_id: [orderSlug], order: userEmail })
    );
  }
  // ดึงข้อมูล Order
  const ordersDetail = await getGristRecords<Table1>(tableName1, filter2);
  const orders = await getGristRecords<Order>(tableName2, filter);
  console.log("ordersDetail", ordersDetail);
  console.log("orders", orders);
  return (
    <>
      <OrderDetail
        ordersDetail={ordersDetail}
        order_id={orderSlug}
        order={orders}
      />
    </>
  );
}
