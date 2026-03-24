import { useEffect, useState } from "react";
import type { CardItem, GameData, GameItem } from "../types/objects";

// Helper function to shuffle array
export const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Helper to calculate optimal grid dimensions
export const calculateGridDimensions = (
  totalCards: number,
): { rows: number; cols: number } => {
  // Tìm số cột và hàng tối ưu cho grid hình chữ nhật
  let cols = Math.ceil(Math.sqrt(totalCards));
  let rows = Math.ceil(totalCards / cols);

  // Điều chỉnh để grid không quá dài
  const targetRatio = 4 / 3; // Tỉ lệ chiều rộng/cao mong muốn
  while (cols / rows > targetRatio && rows < cols) {
    rows++;
    cols = Math.ceil(totalCards / rows);
  }

  while (rows / cols > targetRatio && cols < rows) {
    cols++;
    rows = Math.ceil(totalCards / cols);
  }

  return { rows, cols };
};

// Generate cards from game data với tùy chọn số lượng cặp cho từng item
export const generateCards = (gameData: GameData): CardItem[] => {
  const minPairs = Math.max(gameData.minPairs || 8, 4); // Tối thiểu 4 cặp (8 thẻ)
  const itemsList: GameItem[] = [];

  // Xử lý từng item với số lượng cặp riêng
  gameData.items.forEach((item) => {
    const minItemPairs = item.minPairs || 1;
    // Thêm số lượng cặp theo yêu cầu tối thiểu của item
    for (let i = 0; i < minItemPairs; i++) {
      itemsList.push({ ...item });
    }
  });

  // Nếu chưa đủ minPairs, thêm các item khác vào
  let currentPairs = itemsList.length;
  while (currentPairs < minPairs) {
    const remainingNeeded = minPairs - currentPairs;
    for (let i = 0; i < remainingNeeded && i < gameData.items.length; i++) {
      itemsList.push({ ...gameData.items[i] });
      currentPairs++;
    }
  }

  // Tạo pairs cho mỗi item
  let pairs: { imageSrc: string; keyword: string }[] = [];
  itemsList.forEach((item) => {
    pairs.push({ imageSrc: item.imageSrc, keyword: item.keyword });
    pairs.push({ imageSrc: item.imageSrc, keyword: item.keyword }); // Tạo cặp
  });

  // Shuffle và tạo cards
  const shuffledPairs = shuffleArray(pairs);
  return shuffledPairs.map((pair, index) => ({
    id: `${index}-${Date.now()}-${Math.random()}`,
    imageSrc: pair.imageSrc,
    keyword: pair.keyword,
    isFlipped: false,
    isMatched: false,
  }));
};

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

export const useTiltEffect = (ref: React.RefObject<HTMLElement | null>) => {
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    // Giảm biên độ tilt từ 20 xuống 8
    const rotateX = (y - 0.5) * 8;
    const rotateY = (x - 0.5) * 8;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`,
      transition: "transform 0.1s ease-out",
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
      transition: "transform 0.3s ease-out",
    });
  };

  return { tiltStyle, handleMouseMove, handleMouseLeave };
};
