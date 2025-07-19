"use server";
import {
  addGristRecord,
  getGristRecords,
  Order,
  Table1,
  User_management,
} from "@/lib/grist";
import { cookies } from "next/headers";

interface CreateOrderResult {
  success: boolean;
  message: string;
  orderId?: string; // ถ้ามี Order ID ที่สร้างขึ้น
  data?: any;
}

interface orderListCartResult {
  success: boolean;
  message: string;
  total?: number;
}

interface addOrderProps {
  id: number;
  material_name: string;
  quantity: number;
  price?: number;
  remark?: string;
}
interface userProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  buyer?: string | null; // จาก Grist
  gristName?: string | null; // จาก Grist
}

interface userProps2 {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  buyer?: string | null; // จาก Grist
  gristName?: string | null; // จาก Grist
}

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
export async function createNewOrder(
  orderTitle: string,
  order_id: string,
  addOrder: addOrderProps[],
  session: userProps
): Promise<CreateOrderResult> {
  try {
    if (addOrder.length === 0) {
      return { success: false, message: "Invalidate data to create order." };
    }

    if (order_id === "create") {
      const recordsData = [
        {
          require: {
            order_list: session.email,
            order_name: orderTitle,
          },
          fields: {
            order_name: orderTitle,
            order_list: session.email,
            buyer_list: session.buyer,
          },
        },
      ];
      const records = JSON.stringify({ records: recordsData });
      const updateOrder = await addGristRecord<Order>("Order", records);
      if (updateOrder) {
        return {
          success: false,
          message: "Failed to create order.",
        };
      }
      const filter = JSON.stringify({
        order_name: [orderTitle],
        order_list: [session.email],
      });
      const getOrder = await getGristRecords<Order>("Order", filter);
      if (getOrder.length === 0) {
        return { success: false, message: "Failed to create order." };
      }
      const recordsDataOrder = addOrder.map((item) => ({
        require: {
          order_id: getOrder[0]?.order_id, // Assuming order_id uniquely identifies the main order
        },
        fields: {
          material_name: item.material_name,
          quantity: item.quantity,
          buyer: session.buyer,
          orderer: session.email,
        },
      }));

      const recordsOrder = JSON.stringify({ records: recordsDataOrder });
      const updateOrderDetail = await addGristRecord<Table1>(
        "Table1",
        recordsOrder
      );
      if (updateOrderDetail) {
        return { success: false, message: "Failed to create order detail." };
      }
    } else {
      const filter = JSON.stringify({
        order_id: [order_id],
      });
      const getOrder = await getGristRecords<Order>("Order", filter);
      if (getOrder.length === 0) {
        return { success: false, message: "Failed to create order." };
      }
      if (orderTitle !== getOrder[0]?.order_name) {
        const recordsData = [
          {
            require: {
              order_id: order_id,
            },
            fields: {
              order_name: orderTitle,
            },
          },
        ];
        const records = JSON.stringify({ records: recordsData });
        const updateOrder = await addGristRecord<Order>("Order", records);
        if (updateOrder) {
          return { success: false, message: "Failed to create order." };
        }
      }

      const recordsDataOrderDetail = addOrder.map((item) => ({
        require: {
          order_id: order_id, // Assuming order_id uniquely identifies the main order
        },
        fields: {
          material_name: item.material_name,
          quantity: item.quantity,
        },
      }));

      const recordsOrderDetail = JSON.stringify({
        records: recordsDataOrderDetail,
      });
      const updateOrderDetail = await addGristRecord<Table1>(
        "Table1",
        recordsOrderDetail
      );
      if (updateOrderDetail) {
        return {
          success: false,
          message: "Failed to create order detail.",
          data: recordsDataOrderDetail,
        };
      }
    }

    return {
      success: true,
      message: `Order created successfuly!`,
    };
  } catch (error) {
    return { success: false, message: "Failed to create order." };
  }
}

export async function updateOrder(
  order_id: string,
  orderList: addOrderProps[],
  session: userProps
): Promise<CreateOrderResult> {
  try {
    if (orderList.length === 0) {
      return { success: false, message: "Invalidate data to create order." };
    }
    const filter = JSON.stringify({
      order_id: [order_id],
    });
    const getOrder = await getGristRecords<Order>("Order", filter);
    if (getOrder.length === 0) {
      return { success: false, message: "Failed to order id not found." };
    }
    const recordsDataOrderDeatil = orderList.map((item) => ({
      require: {
        order_id: order_id, // Assuming order_id uniquely identifies the main order
      },
      fields: {
        price: item.price,
        remark: item.remark,
      },
    }));
    const recordsOrderDetail = JSON.stringify({
      records: recordsDataOrderDeatil,
    });
    const updateOrderDetail = await addGristRecord<Table1>(
      "Table1",
      recordsOrderDetail
    );
    if (updateOrderDetail !== null) {
      return { success: false, message: "Failed to update order." };
    }

    const getOrderCheck = await getGristRecords<Table1>("Table1", filter);
    let status = "inprogress";
    if (getOrderCheck.length === orderList.length) {
      status = "success";
    }
    const sum = getOrderCheck.reduce((acc, item) => acc + item.price, 0);
    const recordsDataOrder = [
      {
        require: {
          order_id: order_id, // Assuming order_id uniquely identifies the main order
        },
        fields: {
          status: status,
          price_total: sum,
        },
      },
    ];
    const recordsOrder = JSON.stringify({ records: recordsDataOrder });
    const updateOrder = await addGristRecord<Order>("Order", recordsOrder);
    if (updateOrder !== null) {
      return { success: false, message: "Failed to update order status." };
    }

    return {
      success: true,
      message: `Order update successfuly!`,
    };
  } catch (error) {
    return { success: false, message: "Failed to create order." };
  }
}

export async function orderListCart(
  session: userProps2
): Promise<orderListCartResult> {
  try {
    const filter = JSON.stringify({
      buyer_list: [session.email],
    });
    const getOrder = await getGristRecords<Order>("Order", filter);
    if (getOrder.length === 0) {
      return { success: false, message: "Failed to cart order." };
    }

    return {
      success: true,
      message: `successfuly!`,
      total: getOrder.length,
    };
  } catch (error) {
    return { success: false, message: "Failed to cart order." };
  }
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
