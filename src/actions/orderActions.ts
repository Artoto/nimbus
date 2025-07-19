"use server";
import { addGristRecord, getGristRecords, Order, Table1 } from "@/lib/grist";

interface CreateOrderResult {
  success: boolean;
  message: string;
  orderId?: string; // ถ้ามี Order ID ที่สร้างขึ้น
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
        return { success: false, message: "Failed to create order." };
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
        return { success: false, message: "Failed to create order detail." };
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
