"use client";

import React, { useState, useEffect, Suspense } from "react"; // เพิ่ม useState เพื่อจัดการสถานะโหลด/ข้อความ
import Link from "next/link";
import IconArrowLeft from "./IconArrowLeft";
import IconPlus from "./IconPlus";
import { createNewMenu, deleteMenu } from "../actions/orderActions"; // <-- Import Server Action
import IconTrash from "./IconTrash";
import Loading from "@/app/loading";
import Toast from "./Toast";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface MenuDetailType {
  id: number;
  mo_id: string;
  mo_name: string;
  mo_price: number;
  mo_quantity: number;
  mo_created_at: number;
  mo_updated_at: number;
  menu_id: number;
}
interface Menu {
  id: number;
  menu_id: string;
  menu_name: string;
  menu_price: number;
  menu_created_at: number;
  menu_updated_at: number;
}

interface OrderProps {
  menu: Menu[];
  menusDetail: MenuDetailType[];
  menu_id: string;
}

interface addMenuProps {
  id: number;
  name: string;
  quantity: number;
  price: number;
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
export default function MenuDetailView({
  menu,
  menusDetail,
  menu_id,
}: OrderProps) {
  const arrayCheck = ["create", "buyer"];
  const [orderTitle, setOrderTitle] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [isDuplicateData, setIsDuplicateData] = useState<boolean>(false);
  const [isCreate, setIsCreate] = useState<boolean>(
    arrayCheck.includes(menu_id) ? false : true
  );
  const [addMenu, setAddMenu] = useState<addMenuProps[]>([]);
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
        if (menu.length) {
          setOrderTitle(menu[0]?.menu_name);
        }
        if (menusDetail.length) {
          const data = menusDetail.map((items, index) => ({
            id: items.id,
            name: items.mo_name || "",
            quantity: items.mo_quantity || 0,
            price: items.mo_price || 0,
          }));
          setAddMenu(data);
        }
      } else {
        signOut();
      }
    }
  }, [menusDetail, session, status, menu]);

  const handleCreateAndUpdateButtonClick = async () => {
    setIsLoading(true);
    const checkPriceInOrder = addMenu.filter(
      (item) => item.price === 0 && item
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

    const result = await createNewMenu(orderTitle, menu_id, addMenu); // <-- เรียก Server Action

    if (result.success) {
      setIsError(false);
      setStatusMessage(result.message);
      route.push("/menu");
    } else {
      setIsError(true);
      setStatusMessage(`Error: ${result.message}`);
    }
    setTimeout(() => {
      setStatusMessage("");
      setIsError(false);
    }, 2000);
    setIsLoading(false);
  };

  const hamdleAddFormOrder = () => {
    setAddMenu((prevaddMenu) => [
      ...prevaddMenu,
      {
        id: prevaddMenu.length + 1,
        name: "",
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
    const updatedaddMenu = [...addMenu];
    const newValue =
      name === "quantity" || name === "price" ? Number(value) : value;
    if (name === "material_name") {
      const searchText = updatedaddMenu.filter(
        (item) => item.name === newValue && item
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
    updatedaddMenu[index] = {
      ...updatedaddMenu[index], // Spread ค่าเดิมของ Object นั้นๆ
      [name]: newValue, // อัปเดตเฉพาะ field ที่เปลี่ยน
    };
    // 3. ตั้งค่า State ด้วย Array ใหม่ที่ถูกแก้ไขแล้ว
    setAddMenu(updatedaddMenu);
  };

  const handleDeleteOrder = async (index: number) => {
    let data = [...addMenu];
    if (isCreate) {
      setIsLoading(true);
      const del = [...delOrder, addMenu[index].id];
      const response = await deleteMenu(del);
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
    setAddMenu(data);
  };

  return (
    <>
      {isLoading && <Loading />}
      <div className="flex justify-center items-center my-20 text-gray-900">
        <div className="flex flex-col justify-start items-start border bg-white shadow-xl max-w-5xl w-[90%] h-[90%] rounded-xl py-4 px-5 gap-4">
          <div className="flex justify-between items-center gap-1">
            <Link
              href={`/menu`}
              className="flex justify-start items-center gap-2"
            >
              <IconArrowLeft width="40" height="40" />
              <span className="text-lg sm:text-2xl text-gray-600 underline underline-offset-1">
                Menu Order
              </span>
            </Link>
            {` / `}
            <span className="text-lg sm:text-2xl text-gray-600 underline underline-offset-1">
              {`${menu_id === "create" ? `Create Order` : `Order Detail`}`}
            </span>
          </div>
          <div className="flex justify-center items-center w-full">
            <div className="flex flex-wrap justify-center items-center w-full max-w-3xl">
              <p className="text-2xl basis-full sm:basis-3/12">{`เมนู : `}</p>
              <input
                type="text"
                id="order_name"
                name="order_name"
                className="form-input w-full sm:basis-9/12"
                autoComplete="off"
                value={orderTitle}
                onChange={hamdleOrderTitle}
              />
            </div>
          </div>
          <div className="flex flex-col justify-center items-center w-full gap-4">
            {addMenu.length > 0 &&
              addMenu.map((menu, index) => (
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
                  <div className="flex flex-wrap justify-center items-center w-full">
                    <p className="text-2xl basis-full sm:basis-3/12">{`รายการ : `}</p>
                    <input
                      type="text"
                      name="name"
                      className="form-input w-full sm:basis-9/12"
                      value={menu.name}
                      onChange={(e) => hendleChangeUpdateOrder(index, e)}
                      required
                      autoComplete="off"
                    />
                  </div>
                  <div className="flex flex-wrap justify-center items-center w-full">
                    <p className="text-2xl basis-full sm:basis-3/12">{`จำนวน : `}</p>
                    <input
                      type="text"
                      pattern="[0-9]*"
                      name="quantity"
                      className="form-input w-full sm:basis-9/12"
                      value={menu.quantity}
                      onChange={(e) => hendleChangeUpdateOrder(index, e)}
                      required
                      min={0}
                      autoComplete="off"
                    />
                  </div>
                  <div className="flex flex-wrap justify-center items-center w-full">
                    <p className="text-2xl basis-full sm:basis-3/12">{`ราคา : `}</p>
                    <input
                      type="number"
                      name="price"
                      className="form-input w-full sm:basis-9/12"
                      value={menu.price}
                      onChange={(e) => hendleChangeUpdateOrder(index, e)}
                      required
                      min={0}
                      autoComplete="off"
                    />
                  </div>
                </div>
              ))}

            {addMenu.length > 0 && (
              <button
                type="button"
                className="bg-sky-500 text-white hover:bg-white hover:text-sky-500 hover:border hover:border-solid hover:border-sky-500  rounded-xl py-3 px-4 text-2xl"
                onClick={handleCreateAndUpdateButtonClick}
              >
                บันทึก
              </button>
            )}
            <div className="text-sky-400 py-4 bg-sky-50 border-4 border-dashed border-sky-200 max-w-lg w-full rounded-xl flex flex-col justify-center items-center">
              <p className="text-2xl ">เพิ่มรายการเมนูเลยฮะ</p>
              <button
                type="button"
                onClick={hamdleAddFormOrder}
                className="mt-4 p-2 rounded-full transition duration-300 transform hover:scale-110"
              >
                <IconPlus width="70" height="70" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {statusMessage && <Toast isError={isError} message={statusMessage} />}
    </>
  );
}
