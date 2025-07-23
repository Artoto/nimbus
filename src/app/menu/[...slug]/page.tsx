import { getGristRecords, Menu, Menu_detail } from "@/lib/grist";
import MenuDetailView from "@/compornent/MenuDetail";

interface ManageDetailPageProps {
  params: {
    slug: string[];
  };
}

export default async function ManageDetail({ params }: ManageDetailPageProps) {
  const orderSlug = params.slug?.[0]; // ใช้ Optional Chaining และเข้าถึง element แรก
  const tableName1 = "Manu"; // ชื่อตาราง
  const tableName2 = "Menu_detail"; // ชื่อตาราง
  let filter = ""; // filter

  if (orderSlug) {
    filter = encodeURIComponent(JSON.stringify({ menu_id: [orderSlug] }));
  }
  // ดึงข้อมูล Order
  const menus = await getGristRecords<Menu>(tableName1, filter);
  const menusDetail = await getGristRecords<Menu_detail>(tableName2, filter);
  return (
    <>
      <MenuDetailView
        menu={menus}
        menu_id={orderSlug}
        menusDetail={menusDetail}
      />
    </>
  );
}
