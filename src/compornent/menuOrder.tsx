"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import IconPlus from "@/compornent/IconPlus";
import IconArrowLeft from "./IconArrowLeft";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import IconCart from "./IconCart";
import { addMenuInCart } from "@/actions/orderActions";

interface menuDetailType {
  id: number;
  menu_id: string;
  menu_name: string;
  menu_price: number;
  menu_created_at: number;
  menu_updated_at: number;
}

interface menuProps {
  menu: menuDetailType[];
}
interface userProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  buyer?: string | null; // จาก Grist
  gristName?: string | null; // จาก Grist
}

export default function MenuOrder({ menu }: menuProps) {
  const { data: session, status } = useSession();
  const route = useRouter();
  const [isLoadingMenu, setIsLoadingMenu] = useState<boolean>(false);

  function formatTimestampPadded(timestamp: number): string {
    const date = new Date(timestamp * 1000);

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }
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
        setIsLoadingMenu(true);
        setTimeout(() => {
          setIsLoadingMenu(false);
        }, 2000);
      } else {
        signOut();
      }
    }
  }, [session, status]);

  const hamdleAddMenuInCart = async (menu_id: string) => {
    if (session) {
      const user: userProps | any = session.user;
      const response = await addMenuInCart(menu_id, user);
      console.log("response", response);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center my-20 text-gray-900">
        <div className="flex flex-col justify-start items-start border bg-white shadow-xl max-w-5xl w-[90%] h-[90%] rounded-xl py-3 px-4 gap-4">
          <div className="flex justify-between gap-2 items-center w-full">
            <Link
              href={`/menu`}
              className={`flex justify-center items-center gap-1 text-medium sm:text-xl`}
            >
              <IconArrowLeft width="30" height="30" />
              Menu Order
            </Link>
            <Link
              href="/menu/create"
              className={`flex justify-center items-center gap-1 bg-green-400 text-white hover:bg-white hover:text-green-400 hover:border hover:border-solid hover:border-green-400 p-2 rounded-xl  text-medium sm:text-xl`}
            >
              <IconPlus width="30" height="30" />
              Create Menu
            </Link>
          </div>
          {menu.length === 0 ? (
            <div className="p-5 text-gray-900  w-full text-center text-xl">
              Menu Not Found.
            </div>
          ) : isLoadingMenu ? (
            <div className="flex justify-center items-center w-full">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2  gap-4 w-full">
              {menu.map((items, index) => (
                <div key={index} className="w-full relative">
                  <button
                    type="button"
                    className=" absolute top-[10px] right-[10px]"
                    onClick={() => hamdleAddMenuInCart(items.menu_id)}
                  >
                    <IconCart width="40" height="40" />
                  </button>
                  <Link
                    href={`/menu/${items.menu_id}`}
                    className="cursor-pointer flex flex-col justify-center items-center rounded-xl border  shadow-lg py-3 px-4 w-full"
                  >
                    <div className="flex justify-between items-center w-full">
                      <p className=" text-xl font-semibold text-gray-700">{`ออร์เดอร์ที่ ${
                        index + 1
                      }`}</p>
                    </div>
                    <p className="w-full text-lg font-semibold text-gray-700">{`${items.menu_name}`}</p>
                    <div className="flex justify-between items-center w-full">
                      <p className=" text-md font-medium text-gray-500">{`${formatTimestampPadded(
                        items.menu_updated_at
                      )}`}</p>
                      <p className="text-xl font-semibold text-gray-700">{`${
                        items.menu_price || "0"
                      } บาท`}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
