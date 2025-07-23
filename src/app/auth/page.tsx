"use client";
import { useState, useEffect } from "react";
import IconGoogle from "@/compornent/IconGoogle";
import IconUser from "@/compornent/IconUser";
import { signIn } from "next-auth/react";
import Loading from "../loading";

export default function Auth() {
  const [isError, setIsError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleClickLogin = () => {
    setIsLoading(true);
    signIn("google");
  };
  return (
    <>
      {isLoading && <Loading />}
      <div className=" flex justify-center items-center my-32 sm:my-[170px]">
        <div className="text-black max-w-7xl border border-solid border-black py-10 px-4 w-[90%] h-[90%] sm:w-[500px] flex flex-col gap-8 justify-center items-center rounded-xl box-login">
          <IconUser width="50" height="50" />
          <h1 className="text-2xl sm:text-3xl font-bold">Login Page</h1>
          <button
            type="button"
            className="flex justify-center items-center gap-3 border border-solid border-black rounded-xl w-full sm:w-[400px] h-14 box-border text-xl font-semibold hover:bg-white hover:text-black"
            onClick={handleClickLogin}
          >
            <IconGoogle width="24" height="24" />
            Google
          </button>
        </div>
      </div>
    </>
  );
}
