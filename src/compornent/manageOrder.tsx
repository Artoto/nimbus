"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import IconPlus from "@/compornent/IconPlus";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface OrderDetailType {
  id: number;
  order_id: string;
  order_name: string;
  status: string;
  order_created_at: number;
  order_updated_at: number;
  order_list: string;
}

interface OrderProps {
  orders: OrderDetailType[];
  role?: string;
}
interface userProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  buyer?: string | null; // จาก Grist
  gristName?: string | null; // จาก Grist
}

export default function ManageOrder({ orders, role }: OrderProps) {
  const { data: session, status } = useSession();
  const route = useRouter();
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
      } else {
        signOut();
      }
    }
  }, [session, status]);

  return (
    <>
      <div className="flex justify-center items-center my-20 text-gray-900">
        <div className="flex flex-col justify-start items-start border bg-white shadow-xl max-w-5xl w-[90%] h-[90%] rounded-xl py-4 px-5 gap-4">
          <div className="flex justify-between gap-2 items-center w-full">
            <h1 className="text-medium sm:text-2xl">Manage Order</h1>
            <Link
              href="/manage/create"
              className={`${
                role === "buyer" ? `hidden` : `flex`
              } justify-center items-center gap-1 bg-green-400 text-white hover:bg-white hover:text-green-400 hover:border hover:border-solid hover:border-green-400 py-2 px-4 rounded-xl  text-medium sm:text-xl`}
            >
              <IconPlus width="30" height="30" />
              Create Order
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="p-5 text-gray-900  w-full text-center text-xl">
              Order Not Found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2  gap-4 w-full">
              {orders.map((order, index) => (
                <Link
                  href={
                    role === "buyer"
                      ? `/buyer/${order.order_id}`
                      : `/manage/${order.order_id}`
                  }
                  key={index}
                  className="cursor-pointer flex flex-col justify-center items-center rounded-xl border  shadow-lg py-3 px-4 w-full"
                >
                  <p className="w-full text-xl font-semibold text-gray-700">{`ออร์เดอร์ที่ ${
                    index + 1
                  }`}</p>
                  <p className="w-full text-lg font-semibold text-gray-700">{`ชื่อออร์เดอร์: ${order.order_name}`}</p>
                  <div className="flex justify-between items-center w-full">
                    <p className=" text-md font-medium text-gray-500">{`สั่งเมื่อ: ${formatTimestampPadded(
                      order.order_created_at
                    )}`}</p>
                    <p
                      className={`text-md font-medium  py-2 px-3 border border-solid ${
                        order.status === "unapprove"
                          ? " border-red-500 rounded-lg bg-red-200 text-red-500"
                          : order.status === "inprogress"
                          ? "border-orange-400 rounded-lg bg-orange-200 text-orange-400"
                          : "border-green-500 rounded-lg bg-green-200 text-green-500"
                      }`}
                    >
                      {order.status}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
