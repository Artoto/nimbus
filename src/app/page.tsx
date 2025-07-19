"use client";
import { useEffect, Suspense } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Loading from "./loading";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/profile");
    }
  }, [status]);

  return (
    <>
      <section>
        <Suspense fallback={<Loading />}>
          <div>
            <div>
              <div className="div-body">
                <h1>Welcome to the Website for personal use.</h1>
                <p>The Website is for use watch flow mony out my wallet.</p>
              </div>
              <div>Image Graph</div>
            </div>
            <div>
              <h1>Usage steps</h1>
              <ul>
                <li>Login to google</li>
                <li>Add buyer to your profile</li>
                <li>
                  Manage order to buyer and system send email buyer for buy
                  material
                </li>
                <li>Buyer update status to in progress and buy material</li>
                <li>
                  Order monitor reltime when buyer update status your order.{" "}
                </li>
              </ul>
            </div>
          </div>
        </Suspense>
      </section>
    </>
  );
}
