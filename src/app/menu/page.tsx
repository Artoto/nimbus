"use server";
import { getGristRecords, Menu } from "@/lib/grist";
import MenuOrder from "@/compornent/menuOrder";

export default async function Manage() {
  const tableName = "Manu"; //ชื่อตาราง
  const menus = await getGristRecords<Menu>(tableName);
  return (
    <>
      <MenuOrder menu={menus} />
    </>
  );
}
