// components/StepWebItem.tsx
import React from "react";
import { motion, Variants } from "framer-motion";

interface StepWebItemProps {
  item: {
    id: number;
    title: string;
  };
  isFirst: boolean;
  isLast: boolean;
  position: "left" | "right"; // เพื่อกำหนดว่าการ์ดจะอยู่ซ้ายหรือขวาของเส้น
}

const StepWebItem: React.FC<StepWebItemProps> = ({
  item,
  isFirst,
  isLast,
  position,
}) => {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 },
    },
  };

  // แอนิเมชันสำหรับจุดวงกลม
  const dotVariants: Variants = {
    hidden: { scale: 0 },
    show: {
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 15 },
    },
  };
  function checkEvenOdd(num: number): boolean {
    return num % 2 === 0 ? true : false;
  }

  return (
    <motion.div
      className={`relative flex items-center w-full ${
        position === "left" ? "md:justify-start" : "md:justify-end"
      }`}
      variants={itemVariants}
      // สั่งให้ animate เมื่อ scroll เข้ามาใน viewport
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }} // animate แค่ครั้งเดียว เมื่อเห็นครึ่งหนึ่งของ component
    >
      {/* เส้นเชื่อมต่อด้านในของแต่ละ Item (The connecting line within each item) */}
      {/* เฉพาะบน desktop เท่านั้น และซ่อนเส้นถ้าเป็น item สุดท้าย */}
      {!isLast && (
        <motion.div
          className={`absolute h-full w-1 bg-gray-300 rounded-full hidden md:block ${
            position === "left"
              ? "left-1/2 -translate-x-1/2"
              : "left-1/2 -translate-x-1/2"
          }`}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }} // animate หลังจุด
          style={{ originY: 0 }}
        />
      )}

      {/* จุดวงกลม (The dot) checkEvenOdd*/}
      <motion.div
        className={`absolute top-0  z-10 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center border-4 border-white shadow-md
                   ${
                     checkEvenOdd(item.id) ? ` left-0 md:left-1/2 ` : `left-0`
                   } `} // สำหรับ Mobile: dot อยู่ซ้ายสุด, Desktop: dot อยู่กลางเส้น
        variants={dotVariants}
      >
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </motion.div>

      {/* Card Content */}
      <div
        className={`bg-transparent backdrop-saturate-100 backdrop-blur-lg p-6 rounded-lg shadow-lg max-w-full md:max-w-md w-full border border-white
                   ${
                     position === "left"
                       ? "md:mr-auto md:pr-12"
                       : "md:ml-auto md:pl-12"
                   }`} // เพิ่ม padding เพื่อไม่ให้ทับ dot
      >
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
          <span className="text-gray-900">{item.title}</span>
        </h3>
      </div>
    </motion.div>
  );
};

export default StepWebItem;
