"use client";
import { useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import Loading from "./loading";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import StepWeb from "../compornent/StepWeb";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const experienceData = [
    {
      id: 1,
      title: "1.Login to google",
    },
    {
      id: 2,
      title: "2.Add buyer to your profile",
    },
    {
      id: 3,
      title:
        "3.Manage order to buyer and system send email buyer for buy material",
    },
    {
      id: 4,
      title: "4.Buyer update status to in progress and buy material",
    },
    {
      id: 5,
      title: "5.Order monitor reltime when buyer update status your order",
    },
  ];

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/profile");
    }
  }, [status]);

  return (
    <>
      <section className="py-10">
        <Suspense fallback={<Loading />}>
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold text-center text-gray-900 mb-5"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Welcome to the Website for personal use.
          </motion.h1>
          <motion.p
            className="text-2xl md:text-4xl font-extrabold text-center text-gray-900 mb-5"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            The Website is for use watch flow mony out my wallet.
          </motion.p>
          <StepWeb data={experienceData} />
        </Suspense>
      </section>
    </>
  );
}
