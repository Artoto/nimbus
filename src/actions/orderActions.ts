"use server";
import {
  addGristRecord,
  getGristRecords,
  delGristRecord,
  Order,
  Table1,
  User_management,
  Menu,
  Menu_detail,
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
}

interface fromProps {
  name: string;
  email: string;
  image: string;
  buyer: string;
  gristName: string;
}

interface addMenuProps {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface addMenuState {
  success: boolean;
  message: string;
  data?: string;
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
          material_id: crypto.randomUUID(), //
        },
        fields: {
          material_name: item.material_name,
          quantity: item.quantity,
          buyer: session.buyer,
          order_id: getOrder[0]?.order_id,
          order: session.email,
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
          return { success: false, message: "Failed to update order name." };
        }
      }

      const recordsDataOrderDetail = addOrder.map((item) => ({
        require: {
          material_id: crypto.randomUUID(), //
        },
        fields: {
          order_id: order_id,
          material_name: item.material_name,
          quantity: item.quantity,
          buyer: session.buyer,
          order: session.email,
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

    const filter2 = JSON.stringify({
      order_id: [order_id],
      buyer: [session.email],
    });
    const getOrderDetail = await getGristRecords<Table1>("Table1", filter2);
    if (getOrderDetail.length === 0) {
      return { success: false, message: "Failed to order detail not found." };
    }
    const recordsDataOrderDeatil = orderList.map((item, index) => {
      const data = getOrderDetail.filter(
        (item2) => item2.material_name === item.material_name && item2
      );
      if (data.length > 0) {
        return {
          require: {
            material_id: data[0]?.material_id,
          },
          fields: {
            price: item.price,
            remark: item.remark,
          },
        };
      } else {
        return {
          require: {
            material_id: crypto.randomUUID(),
          },
          fields: {
            price: item.price,
            remark: item.remark,
          },
        };
      }
    });
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

export async function deleteOrder(delOrder: any[]): Promise<CreateOrderResult> {
  try {
    if (delOrder.length === 0) {
      return { success: false, message: "Failed to delete order." };
    }

    const deleteOrder = await delGristRecord<Table1>(
      "Table1",
      JSON.stringify(delOrder)
    );
    if (deleteOrder) {
      return { success: false, message: "Failed to delete order." };
    }
    return {
      success: true,
      message: `Order delete successfuly!`,
    };
  } catch (error) {
    return { success: false, message: "Failed to delete order." };
  }
}

export async function createNewMenu(
  menuTitle: string,
  menu_id: string,
  formData: addMenuProps[]
): Promise<addMenuState> {
  try {
    if (formData.length === 0 || !menu_id || !menuTitle) {
      return { success: false, message: "invalldate value" };
    }
    const tableMenu = "Manu";
    const tableMenuDetail = "Menu_detail";
    if (menu_id === "create") {
      const sum = formData.reduce((acc, item) => acc + item.price, 0);

      const randomMenuId = crypto.randomUUID();
      const recordsMenu = [
        {
          require: {
            menu_id: randomMenuId,
          },
          fields: {
            menu_name: menuTitle,
            menu_price: sum,
          },
        },
      ];
      const records = JSON.stringify({ records: recordsMenu });
      const addMenu = await addGristRecord<Menu>(tableMenu, records);
      if (addMenu !== null) {
        return { success: false, message: "Fail Create Menu." };
      }
      const recordsMenuDetail = formData.map((item, index) => ({
        require: {
          mo_id: crypto.randomUUID(),
        },
        fields: {
          menu_id: randomMenuId,
          mo_name: item.name,
          mo_price: item.price,
          mo_quantity: item.quantity,
        },
      }));
      const recordsDetail = JSON.stringify({ records: recordsMenuDetail });
      const addMenuDetail = await addGristRecord<Menu_detail>(
        tableMenuDetail,
        recordsDetail
      );
      if (addMenuDetail !== null) {
        return { success: false, message: "Fail Create Menu Detail." };
      }
    } else {
      const recordsGetDataMenu = JSON.stringify({ menu_id: [menu_id] });
      const getMenuCheckData = await getGristRecords<Menu>(
        tableMenu,
        recordsGetDataMenu
      );
      if (getMenuCheckData.length === 0) {
        return { success: false, message: "Menu data not found." };
      }
      const recordsMenuDetail = formData.map((item, index) => ({
        require: {
          mo_name: item.name,
        },
        fields: {
          menu_id: getMenuCheckData[0]?.menu_id,
          mo_name: item.name,
          mo_price: item.price,
          mo_quantity: item.quantity,
        },
      }));
      const recordsDetail = JSON.stringify({ records: recordsMenuDetail });
      const addMenuDetail = await addGristRecord<Menu_detail>(
        tableMenuDetail,
        recordsDetail
      );
      if (addMenuDetail !== null) {
        return { success: false, message: "Fail Create Menu Detail." };
      }
      const sum = formData.reduce((acc, item) => acc + item.price, 0);
      const recordsMenu = [
        {
          require: {
            menu_id: getMenuCheckData[0]?.menu_id,
          },
          fields: {
            menu_price: sum,
          },
        },
      ];
      const records = JSON.stringify({ records: recordsMenu });
      const addMenu = await addGristRecord<Menu>(tableMenu, records);
      if (addMenu !== null) {
        return { success: false, message: "Fail Create Menu." };
      }
    }
    return { success: true, message: "Menu Create Successfuly." };
  } catch (error) {
    return { success: false, message: `Error :${error}` };
  }
}

export async function addMenuInCart(
  menu_id: string,
  session: userProps
): Promise<addMenuState> {
  try {
    if (!menu_id || !session) {
      return { success: false, message: "invalldate value" };
    }
    const tablName = "Manu";
    const recordsGetDataMenu = JSON.stringify({ menu_id: [menu_id] });
    const getMenu = await getGristRecords<Menu>(tablName, recordsGetDataMenu);
    if (getMenu.length === 0) {
      return { success: false, message: "Fail menu_id data not found." };
    }
    const recordsData = [
      {
        require: {
          order_list: session.email,
          order_name: getMenu[0]?.menu_name,
        },
        fields: {
          order_name: getMenu[0]?.menu_name,
          order_list: session.email,
          buyer_list: session.buyer,
          price_total: getMenu[0]?.menu_price,
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
      order_name: [getMenu[0]?.menu_name],
      order_list: [session.email],
    });
    const getOrder = await getGristRecords<Order>("Order", filter);
    if (getOrder.length === 0) {
      return { success: false, message: "Failed to create order." };
    }
    const recordsDataOrder = [
      {
        require: {
          material_id: crypto.randomUUID(), //
        },
        fields: {
          material_name: getMenu[0]?.menu_name,
          quantity: 1,
          buyer: session.buyer,
          order_id: getOrder[0]?.order_id,
          order: session.email,
          menu_id: getMenu[0]?.menu_id,
          price: getMenu[0]?.menu_price,
        },
      },
    ];

    const recordsOrder = JSON.stringify({ records: recordsDataOrder });
    const updateOrderDetail = await addGristRecord<Table1>(
      "Table1",
      recordsOrder
    );
    if (updateOrderDetail) {
      return { success: false, message: "Failed to create order detail." };
    }
    return { success: true, message: "Order Add Successfuly." };
  } catch (error) {
    return { success: false, message: `Error :${error}` };
  }
}

export async function deleteOrderAll(
  delOrder: string
): Promise<CreateOrderResult> {
  try {
    if (!delOrder) {
      return { success: false, message: "Failed to delete order." };
    }
    const getOrder = await getGristRecords<Order>(
      "Order",
      JSON.stringify({ order_id: [delOrder] })
    );
    if (getOrder.length === 0) {
      return { success: false, message: "Failed order id not found." };
    }
    const getOrderDetail = await getGristRecords<Table1>(
      "Table1",
      JSON.stringify({ order_id: [delOrder] })
    );
    if (getOrderDetail.length === 0) {
      return { success: false, message: "Failed order detail not found." };
    }
    const arrayDelOrder = getOrder.map((items) => items.id);
    const arrayDelOrderDetail = getOrderDetail.map((items) => items.id);
    const deleteOrder = await delGristRecord<Order>(
      "Order",
      JSON.stringify(arrayDelOrder)
    );
    if (deleteOrder) {
      return { success: false, message: "Failed to delete order." };
    }
    const deleteOrderDetail = await delGristRecord<Table1>(
      "Table1",
      JSON.stringify(arrayDelOrderDetail)
    );
    if (deleteOrderDetail) {
      return { success: false, message: "Failed to delete order." };
    }
    return {
      success: true,
      message: `Order delete successfuly!`,
    };
  } catch (error) {
    return { success: false, message: "Failed to delete order." };
  }
}

export async function updateOrderStatus(
  order_id: string
): Promise<CreateOrderResult> {
  try {
    if (!order_id) {
      return { success: false, message: "Invalidate data to create order." };
    }
    const recordsDataOrder = [
      {
        require: {
          order_id: order_id, // Assuming order_id uniquely identifies the main order
        },
        fields: {
          status: "success",
        },
      },
    ];
    const recordsOrder = JSON.stringify({ records: recordsDataOrder });
    const updateOrderStatus = await addGristRecord<Order>(
      "Order",
      recordsOrder
    );
    if (updateOrderStatus !== null) {
      return { success: false, message: "Fail Update Order Status." };
    }
    return {
      success: true,
      message: `Order update successfuly!`,
    };
  } catch (error) {
    return { success: false, message: "Failed to create order." };
  }
}
