import { motion } from "framer-motion";
import type { CardProps } from "../types/components";

const Card = ({ item, isFlipped, isMatched, cardBack, onClick }: CardProps) => {
  return (
    <div className="relative w-full h-full perspective-1000">
      <motion.div
        className="w-full h-full relative preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped || isMatched ? 180 : 0 }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
        onClick={!isFlipped && !isMatched ? onClick : undefined}
      >
        {/* Mặt sau (Lúc chưa lật) */}
        <div className="absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
          {typeof cardBack === "string" && cardBack.length <= 2 ? (
            <span className="text-5xl">{cardBack}</span>
          ) : (
            <img
              src={cardBack}
              alt="back"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Mặt trước (Hình ảnh) */}
        <div className="absolute inset-0 backface-hidden rotateY-180 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-yellow-400 shadow-lg flex items-center justify-center">
          {item.imageSrc.startsWith("http") ? (
            <img
              src={item.imageSrc}
              alt={item.keyword}
              className="w-[80%] h-[80%] object-contain"
            />
          ) : (
            <span className="text-6xl">{item.imageSrc}</span>
          )}

          {/* Hiển thị keyword khi đã match */}
          {isMatched && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center backdrop-blur-sm"
            >
              <span className="text-3xl font-black text-white drop-shadow-lg">
                {item.keyword}
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export { Card };
