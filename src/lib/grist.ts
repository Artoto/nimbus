// src/lib/grist.ts
import { GristDocAPI } from "grist-api";
// 1. กำหนด Type สำหรับแต่ละตาราง
export interface Table1 {
  id: number;
  material_id: string;
  material_name: string;
  quantity: number;
  price: number;
  order: string;
  buyer: string;
  order_id: string;
  created_at: number;
  updated_at: number;
  remark: string;
  menu_id: string;
}

export interface Order {
  id: number;
  order_id: string;
  order_name: string;
  status: "unapprove" | "inprogress" | "sucess";
  order_created_at: number;
  order_updated_at: number;
  order_list: string;
  buyer_list: string;
  price_total: number;
}

export interface User_management {
  id: number;
  um_id: number;
  um_email: string;
  um_name: string;
  um_created_at: number;
  um_updated_at: number;
  buyer: string;
}

export interface Menu {
  id: number;
  menu_id: string;
  menu_name: string;
  menu_price: number;
  menu_created_at: number;
  menu_updated_at: number;
}

export interface Menu_detail {
  id: number;
  mo_id: string;
  mo_name: string;
  mo_price: number;
  mo_quantity: number;
  mo_created_at: number;
  mo_updated_at: number;
  menu_id: number;
}

// 2. กำหนด Type รวมสำหรับ GristRecord ทั้งหมด (ใช้ในฟังก์ชันทั่วไป)
// Type นี้จะช่วยให้ TypeScript ตรวจสอบได้ว่าคุณพยายามเข้าถึง Field ที่ไม่มีอยู่หรือไม่
export type GristAnyRecord = Table1 | User_management | Order;

const GRIST_API_KEY = process.env.GRIST_API_KEY || "";
const GRIST_DOC_URL = process.env.GRIST_PATH_URL || "";

if (!GRIST_API_KEY || !GRIST_DOC_URL) {
  throw new Error(
    "Missing GRIST_API_KEY or GRIST_DOC_URL in environment variables."
  );
}

const getGristApiUrl = (tableName: string, filter?: string) => {
  return `${GRIST_DOC_URL}/${tableName}/records${
    filter ? `?filter=${filter}` : ``
  }`;
};

// 3. ฟังก์ชันสำหรับดึงข้อมูล (ใช้ Generic Type <T>)
// ฟังก์ชันนี้จะรับชื่อตารางและคืนค่าเป็น Array ของ Type ที่คุณระบุ
export async function getGristRecords<T>(
  tableName: string,
  filter?: string
): Promise<T[]> {
  try {
    const apiUrl = getGristApiUrl(tableName, filter);
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GRIST_API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch data from Grist table '${tableName}': ${response.status} ${response.statusText} - ${errorText}`
      );
    }
    const data = await response.json();

    if (Array.isArray(data)) {
      return data as T[];
    }
    // Handle Grist's column-oriented response if necessary
    if (
      data &&
      typeof data === "object" &&
      data.records &&
      Array.isArray(data.records)
    ) {
      interface records {
        id: number;
        fields: object;
      }
      return data.records.map((item: records) => ({
        ...item.fields,
        id: item.id,
      }));
    }

    return [];
  } catch (error) {
    return [];
  }
}

// 4. ฟังก์ชันสำหรับเพิ่มข้อมูล (ใช้ Generic Type <T>)
export async function addGristRecord<T>(tableName: string, records: string) {
  try {
    const apiUrl = getGristApiUrl(tableName);

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GRIST_API_KEY}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
      body: records,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(
        `Failed to add record to Grist table '${tableName}': ${response.status} ${response.statusText} - ${errorText}`
      );
      throw new Error(
        `Failed to add record to Grist table '${tableName}': ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to add record to Grist table ${error}`);
  }
}

export async function delGristRecord<T>(tableName: string, records: string) {
  try {
    const response = await fetch(`${GRIST_DOC_URL}/${tableName}/data/delete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GRIST_API_KEY}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
      body: records,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to add record to Grist table '${tableName}': ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
}
