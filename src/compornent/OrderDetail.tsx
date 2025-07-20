// src/components/OrderDetail.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react"; // เพิ่ม useState เพื่อจัดการสถานะโหลด/ข้อความ
import Link from "next/link";
import IconArrowLeft from "./IconArrowLeft";
import IconPlus from "./IconPlus";
import {
  createNewOrder,
  updateOrder,
  deleteOrder,
} from "../actions/orderActions"; // <-- Import Server Action
import IconTrash from "./IconTrash";
import Loading from "@/app/loading";
import Toast from "./Toast";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface OrderDetailType {
  // เปลี่ยนชื่อ interface เพื่อไม่ให้ซ้ำกับชื่อ Component
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
}
interface Order {
  id: number;
  order_id: string;
  order_name: string;
  status: "unapprove" | "inprogress" | "sucess";
  order_created_at: number;
  order_updated_at: number;
  order_list: string;
}

interface OrderProps {
  order: Order[];
  ordersDetail: OrderDetailType[];
  order_id: string;
  role?: string;
}

interface addOrderProps {
  id: number;
  material_name: string;
  quantity: number;
  price?: number;
  remark?: string;
}

interface delOrderProps {
  id: number[];
}

interface userProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  buyer?: string | null; // จาก Grist
  gristName?: string | null; // จาก Grist
}

// เปลี่ยนชื่อ Component เป็น OrderDetailView เพื่อให้ชัดเจน
export default function OrderDetailView({
  ordersDetail,
  order_id,
  order,
  role,
}: OrderProps) {
  const arrayCheck = ["create", "buyer"];
  const [orderTitle, setOrderTitle] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [isDuplicateData, setIsDuplicateData] = useState<boolean>(false);
  const [isCreate, setIsCreate] = useState<boolean>(
    arrayCheck.includes(order_id) ? false : true
  );
  const [addOrder, setAddOrder] = useState<addOrderProps[]>([]);
  const [delOrder, setDelOrder] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const route = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      route.push("/");
    }

    if (session) {
      const user: userProps | any = session.user;
      if (
        user?.email === "nongponddee@gmail.com" ||
        user?.email === "supertoplnw001@gmail.com"
      ) {
        if (order.length) {
          setOrderTitle(order[0]?.order_name);
        }
        if (ordersDetail.length) {
          const data = ordersDetail.map((items, index) => ({
            id: items.id,
            material_name: items.material_name || "",
            quantity: items.quantity || 0,
            price: items.price || 0,
            remark: items.remark || "",
          }));
          setAddOrder(data);
        }
      } else {
        signOut();
      }
    }
  }, [ordersDetail, session, status, order]);

  // นี่คือฟังก์ชันที่เรียก Server Action เมื่อปุ่มถูกคลิก
  const handleCreateButtonClick = async () => {
    setIsLoading(true);
    if (session) {
      let user: userProps | any = session.user;
      const result = await createNewOrder(orderTitle, order_id, addOrder, user); // <-- เรียก Server Action
      if (isDuplicateData) {
        setStatusMessage("กรอกรายการซ้ำ");
        return false;
      }
      if (result.success) {
        setStatusMessage(result.message);
        setIsCreate(true);
        // คุณอาจจะต้องการ redirect หรือ clear form ที่นี่
      } else {
        setStatusMessage(`Error: ${result.message}`);
      }
      setTimeout(() => {
        setStatusMessage("");
      }, 2000);
      setIsLoading(false);
      if (result.success) {
        route.push(role === "buyer" ? "/buyer" : "/manage");
      }
    }
  };

  const handleUpdateButtonClick = async () => {
    setIsLoading(true);
    const checkPriceInOrder = addOrder.filter(
      (item) => item.price === 0 && item.remark === "" && item
    );
    if (isDuplicateData) {
      setStatusMessage("กรอกรายการซ้ำ");
      setTimeout(() => {
        setStatusMessage("");
        setIsError(false);
      }, 2000);
      return false;
    }
    if (checkPriceInOrder.length > 0) {
      setStatusMessage(`Please fill in the order price.`);
      setIsError(true);
      setTimeout(() => {
        setStatusMessage("");
        setIsError(false);
      }, 2000);
      setIsLoading(false);
      return false;
    }

    if (session) {
      let user: userProps | any = session.user;
      const result = await updateOrder(order_id, addOrder, user); // <-- เรียก Server Action

      if (result.success) {
        setIsError(false);
        setStatusMessage(result.message);
      } else {
        setIsError(true);
        setStatusMessage(`Error: ${result.message}`);
      }
      setTimeout(() => {
        setStatusMessage("");
        setIsError(false);
      }, 2000);
      setIsLoading(false);
      if (result.success) {
        route.push(role === "buyer" ? "/buyer" : "/manage");
      }
    }
  };

  const hamdleAddFormOrder = () => {
    setAddOrder((prevAddOrder) => [
      ...prevAddOrder,
      {
        id: prevAddOrder.length + 1,
        material_name: "",
        quantity: 0,
        price: 0,
        remark: "",
      },
    ]);
  };

  const hamdleOrderTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setOrderTitle(value);
  };

  const hendleChangeUpdateOrder = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target; // name จะเป็น "quantity" หรือ "material_name"
    const updatedAddOrder = [...addOrder];
    const newValue = name === "quantity" ? Number(value) : value;
    if (name === "material_name") {
      const searchText = updatedAddOrder.filter(
        (item) => item.material_name === newValue && item
      );
      if (searchText.length > 0) {
        setStatusMessage("กรอกรายการซ้ำ");
        setIsDuplicateData(true);
        setIsError(true);
        setTimeout(() => {
          setStatusMessage("");
        }, 4000);
      } else {
        setStatusMessage("");
        setIsDuplicateData(false);
        setIsError(false);
      }
    }
    updatedAddOrder[index] = {
      ...updatedAddOrder[index], // Spread ค่าเดิมของ Object นั้นๆ
      [name]: newValue, // อัปเดตเฉพาะ field ที่เปลี่ยน
    };
    // 3. ตั้งค่า State ด้วย Array ใหม่ที่ถูกแก้ไขแล้ว
    setAddOrder(updatedAddOrder);
  };

  const handleDeleteOrder = async (index: number) => {
    let data = [...addOrder];
    if (isCreate) {
      setIsLoading(true);
      const del = [...delOrder, addOrder[index].id];
      const response = await deleteOrder(del);
      if (!response.success) {
        setStatusMessage(response.message);
        setIsError(true);
        setIsLoading(false);
        setTimeout(() => {
          setStatusMessage("");
          setIsError(false);
        }, 2000);
        return false;
      }
      setTimeout(() => {
        setStatusMessage("");
        setIsError(false);
      }, 2000);
      setIsLoading(false);
    }

    data.splice(index, 1);
    data.map((item, index) => ({ ...item, id: index + 1 }));
    setAddOrder(data);
  };

  return (
    <>
      {isLoading && <Loading />}
      <div className="flex justify-center items-center my-20 text-gray-900">
        <div className="flex flex-col justify-start items-start border bg-white shadow-xl max-w-5xl w-[90%] h-[90%] rounded-xl py-4 px-5 gap-4">
          <div className="flex justify-between items-center gap-1">
            <Link
              href={role === "buyer" ? `/buyer` : `/manage`}
              className="flex justify-start items-center gap-2"
            >
              <IconArrowLeft width="40" height="40" />
              <span className="text-lg sm:text-2xl text-gray-600 underline underline-offset-1">
                Manage Order
              </span>
            </Link>
            {` / `}
            <span className="text-lg sm:text-2xl text-gray-600 underline underline-offset-1">
              {`${order_id === "create" ? `Create Order` : `Order Detail`}`}
            </span>
          </div>
          <div className="flex justify-center items-center w-full">
            <div className="flex flex-wrap justify-center items-center w-full max-w-3xl">
              <p className="text-2xl basis-full sm:basis-3/12">{`หัวข้อรายการ : `}</p>
              {role === "buyer" ? (
                <input
                  type="text"
                  id="order_name"
                  name="order_name"
                  className="form-input w-full sm:basis-9/12"
                  autoComplete="off"
                  value={orderTitle}
                  onChange={hamdleOrderTitle}
                  readOnly
                />
              ) : (
                <input
                  type="text"
                  id="order_name"
                  name="order_name"
                  className="form-input w-full sm:basis-9/12"
                  autoComplete="off"
                  value={orderTitle}
                  onChange={hamdleOrderTitle}
                />
              )}
            </div>
          </div>
          <div className="flex flex-col justify-center items-center w-full gap-4">
            {addOrder.length > 0 &&
              addOrder.map((order, index) => (
                <div
                  key={index}
                  className="p-4 border shadow-lg max-w-3xl rounded-xl flex flex-col gap-3 justify-center items-center w-full relative"
                >
                  <button
                    type="button"
                    className="absolute top-1 right-1 text-red-500 transition duration-300 transform hover:scale-110"
                    onClick={() => handleDeleteOrder(index)}
                  >
                    <IconTrash width="35" height="35" />
                  </button>
                  <h1 className="text-2xl w-full text-left">{`ออร์เดอร์ที่ ${
                    index + 1
                  }`}</h1>
                  {role !== "buyer" && order.remark && (
                    <p className="text-lg w-full text-left">{order.remark}</p>
                  )}
                  <div className="flex flex-wrap justify-center items-center w-full">
                    <p className="text-2xl basis-full sm:basis-3/12">{`รายการ : `}</p>
                    {role === "buyer" ? (
                      <input
                        type="text"
                        name="material_name"
                        className="form-input w-full sm:basis-9/12"
                        value={order.material_name}
                        onChange={(e) => hendleChangeUpdateOrder(index, e)}
                        required
                        autoComplete="off"
                        readOnly
                      />
                    ) : (
                      <input
                        type="text"
                        name="material_name"
                        className="form-input w-full sm:basis-9/12"
                        value={order.material_name}
                        onChange={(e) => hendleChangeUpdateOrder(index, e)}
                        required
                        autoComplete="off"
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center items-center w-full">
                    <p className="text-2xl basis-full sm:basis-3/12">{`จำนวน : `}</p>
                    {role === "buyer" ? (
                      <input
                        type="number"
                        name="quantity"
                        className="form-input w-full sm:basis-9/12"
                        value={order.quantity}
                        onChange={(e) => hendleChangeUpdateOrder(index, e)}
                        required
                        autoComplete="off"
                        readOnly
                      />
                    ) : (
                      <input
                        type="text"
                        pattern="[0-9]*"
                        name="quantity"
                        className="form-input w-full sm:basis-9/12"
                        value={order.quantity}
                        onChange={(e) => hendleChangeUpdateOrder(index, e)}
                        required
                        min={0}
                        autoComplete="off"
                      />
                    )}
                  </div>

                  {role === "buyer" && (
                    <>
                      <div className="flex flex-wrap justify-center items-center w-full">
                        <p className="text-2xl basis-full sm:basis-3/12">{`ราคา : `}</p>
                        <input
                          type="number"
                          name="price"
                          className="form-input w-full sm:basis-9/12"
                          value={order.price}
                          onChange={(e) => hendleChangeUpdateOrder(index, e)}
                          required
                          min={0}
                          autoComplete="off"
                        />
                      </div>
                      <div className="flex flex-wrap justify-center items-center w-full">
                        <p className="text-2xl basis-full sm:basis-3/12">{`หมายเหตุ : `}</p>
                        <input
                          type="text"
                          name="remark"
                          className="form-input w-full sm:basis-9/12"
                          value={order.remark}
                          onChange={(e) => hendleChangeUpdateOrder(index, e)}
                          required
                          autoComplete="off"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}

            {addOrder.length > 0 && (
              <button
                type="button"
                className="bg-sky-500 text-white hover:bg-white hover:text-sky-500 hover:border hover:border-solid hover:border-sky-500  rounded-xl py-3 px-4 text-2xl"
                onClick={
                  role === "buyer"
                    ? handleUpdateButtonClick
                    : handleCreateButtonClick
                }
              >
                ส่งออร์เดอร์
              </button>
            )}
            {role !== "buyer" && (
              <div className="text-sky-400 py-4 bg-sky-50 border-4 border-dashed border-sky-200 max-w-lg w-full rounded-xl flex flex-col justify-center items-center">
                <p className="text-2xl ">เพิ่มออร์เดอร์เลยฮะ</p>
                <button
                  type="button"
                  onClick={hamdleAddFormOrder}
                  className="mt-4 p-2 rounded-full transition duration-300 transform hover:scale-110"
                >
                  <IconPlus width="70" height="70" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {statusMessage && <Toast isError={isError} message={statusMessage} />}
    </>
  );
}
