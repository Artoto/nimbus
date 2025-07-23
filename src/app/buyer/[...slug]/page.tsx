import { getGristRecords, Table1, Order, Menu_detail } from "@/lib/grist";
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
  const tableName3 = "Menu_detail"; // ชื่อตาราง
  let filter = ""; // filter
  let filter2 = ""; // filter
  let menuDetails: Menu_detail[] = [];
  if (orderSlug) {
    filter = encodeURIComponent(JSON.stringify({ order_id: [orderSlug] }));
    filter2 = encodeURIComponent(
      JSON.stringify({ order_id: [orderSlug], buyer: [userEmail] })
    );
  }
  // ดึงข้อมูล Order
  const orders = await getGristRecords<Order>(tableName2, filter);
  const ordersDetail = await getGristRecords<Table1>(tableName1, filter2);
  const searchMenuId = ordersDetail.map((items) => items.menu_id);
  if (searchMenuId.length > 0) {
    const MenuDetail = await getGristRecords<Menu_detail>(
      tableName3,
      JSON.stringify({ menu_id: searchMenuId })
    );
    menuDetails = MenuDetail;
  }

  return (
    <>
      <OrderDetail
        ordersDetail={ordersDetail}
        order_id={orderSlug}
        order={orders}
        menu={menuDetails}
        role="buyer"
      />
    </>
  );
}
