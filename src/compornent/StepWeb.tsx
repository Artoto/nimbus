// components/Timeline.tsx
import React from "react";
import { motion } from "framer-motion";
import StepWebItem from "./StepWebItem"; // Import StepWebItem

// กำหนด Type ของข้อมูล Timeline
interface TimelineData {
  id: number;
  title: string;
}

interface TimelineProps {
  data: TimelineData[];
}

const Timeline: React.FC<TimelineProps> = ({ data }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // ให้แต่ละ StepWebItem ค่อยๆ โผล่มา
      },
    },
  };

  return (
    <div className="relative py-8 md:py-16 px-4 md:px-0 max-w-4xl mx-auto">
      {/* เส้นแนวตั้ง (The main vertical line) */}
      {/* เราจะใช้เส้นนี้เป็นพื้นหลัง และให้แต่ละ Item มีเส้นของตัวเองมาเชื่อม */}

      <motion.div
        className="flex flex-col space-y-12 md:space-y-0"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {data.map((item, index) => (
          <StepWebItem
            key={item.id}
            item={item}
            isFirst={index === 0}
            isLast={index === data.length - 1}
            position={index % 2 === 0 ? "left" : "right"} // สลับซ้ายขวา
          />
        ))}
      </motion.div>
    </div>
  );
};

export default Timeline;
