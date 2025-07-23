"use client";
import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import "../style/profile.css";
import { Avatar } from "@nextui-org/react";
import Link from "next/link";
import IconArrowLeft from "@/compornent/IconArrowLeft";
import { searchUser } from "@/actions/orderActions";
import IconClose from "@/compornent/IconClose";
import Loading from "../loading";
import Toast from "@/compornent/Toast";

interface fromProps {
  name: string;
  email: string;
  image: string;
  buyer: string;
  gristName: string;
}

interface userProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  buyer?: string | null; // จาก Grist
  gristName?: string | null; // จาก Grist
}

interface errorProps {
  buyer: boolean;
  search?: boolean;
}

export default function Profile() {
  const { data: session, status } = useSession();
  const route = useRouter();
  const [from, setFrom] = useState<fromProps>({
    name: "",
    email: "",
    image: "",
    buyer: "",
    gristName: "",
  });
  const [isError, setIsError] = useState<errorProps>({
    buyer: false,
    search: false,
  });

  const [isBuyer, setIsBuyer] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messageStatus, setMessageStatus] = useState<string>("");

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
        let data = {
          ...from,
          name: user?.name || "",
          email: user?.email || "",
          image: user?.image || "",
          buyer: user?.buyer || localStorage.getItem("useByuer") || "",
          gristName: user?.gristName || "",
        };
        const error = {
          ...isError,
          buyer: user?.buyer || localStorage.getItem("useByuer") ? false : true,
        };
        setFrom(data);
        setIsError(error);
        setIsBuyer(
          user?.buyer || localStorage.getItem("useByuer") ? "success" : ""
        );
      } else {
        signOut();
      }
    }
  }, [status, session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newFormData = {
      ...isError,
    };
    if (value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[A-Za-z0-9\-_.]+$/;
      const enPattern = /^[A-Za-z0-9\s/!@#$%^&*(),.\-_?":{}|<>]*$/;
      if (!enPattern.test(value) || !emailPattern.test(value)) {
        newFormData = {
          ...newFormData,
          [name]: true,
        };
      } else {
        newFormData = {
          ...newFormData,
          [name]: false,
        };
      }

      setIsError(newFormData);
    }
    setFrom({ ...from, [name]: value.toLowerCase() });
  };

  const handleKey = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsLoading(true);
      const response = await searchUser(from);
      if (response.message === "success") {
        setFrom({ ...from, buyer: response.data || "" });
        setIsBuyer(response.message);
        setMessageStatus(response.message);
        localStorage.setItem("useByuer", response.data || "");
      } else {
        setIsError({ ...isError, search: true });
        setMessageStatus(response.message);
      }
      setTimeout(() => {
        setIsLoading(false);
        setIsError({ ...isError, search: false });
      }, 2000);
    }
  };
  const handleDeleteBuyer = () => {
    let data = {
      ...from,
      buyer: "",
    };
    setFrom(data);
  };

  return (
    <>
      {isLoading && <Loading />}
      <div className=" flex justify-center items-center my-20 sm:my-[170px] body-manage text-black">
        <div className="bg-white max-w-7xl py-10 px-4 w-[90%] h-[90%] sm:w-[500px] flex flex-col gap-8 justify-center items-center rounded-xl shadow-xl border">
          <Link
            href="/manage"
            className="flex justify-start items-center w-full gap-2"
          >
            <IconArrowLeft width="40" height="40" />
            <span className="text-xl sm:text-2xl text-gray-600 underline underline-offset-1">
              Manage Order / Profile
            </span>
          </Link>
          <Avatar
            className="w-50 h-50 text-large"
            src={from?.image || "/img/Avatar.png"}
          />
          <div className="flex flex-col justify-start items-start gap-4 text-lg font-medium">
            <input type="hidden" id="email" name="email" value={from.email} />
            <p className="text-gray-700">
              {"ชื่อ : "}
              <span className="font-semibold text-gray-900">
                {from?.gristName || ""}
              </span>
            </p>
            <p className="text-gray-700">
              {"อีเมล : "}
              <span className="font-semibold text-gray-900">
                {from?.email || ""}
              </span>
            </p>
            <div className="text-gray-700 box-border relative">
              {"ผู้ซื้อของ : "}
              {isBuyer === "success" ? (
                <div className=" w-full absolute top-0 right-[-90px]">
                  <span className="p-2 sm:p-4 rounded-xl bg-gray-200 text-medium">
                    {from.buyer}
                  </span>
                  {/* <button
                    type="button"
                    className="absolute top-[-10px] right-[-194px]"
                    onClick={handleDeleteBuyer}
                  >
                    <IconClose width="20" height="20" />
                  </button> */}
                </div>
              ) : (
                <input
                  type="text"
                  id="buyer"
                  name="buyer"
                  placeholder="กรอกอีเมลผู้ซื้อของ"
                  value={from.buyer}
                  onChange={handleChange}
                  onKeyDown={handleKey}
                  className={`bg-white focus:outline-none py-4 pl-5 pr-6 box-border  ${
                    isError?.buyer && !from.buyer
                      ? ` border border-solid border-red-500 rounded-xl`
                      : ``
                  }`}
                  required
                  autoComplete="off"
                />
              )}
            </div>
            <div
              className={`text-red-500 relative w-full ${
                isError?.buyer && !from.buyer ? ` inline-block` : ` hidden`
              }`}
            >
              <small className=" absolute top-[-12px] left-[100px]">
                กรอกอีเมลผู้ซื้อของไม่ถูกต้อง
              </small>
            </div>
          </div>
        </div>
      </div>
      {isError.search && (
        <Toast message={messageStatus} isError={isError.search} />
      )}
    </>
  );
}
