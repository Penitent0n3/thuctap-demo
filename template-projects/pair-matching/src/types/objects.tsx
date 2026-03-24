// --- Định nghĩa kiểu dữ liệu ---
// types.ts
// --- Định nghĩa kiểu dữ liệu ---
export interface CardItem {
  id: string;
  imageSrc: string;
  keyword: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface GameItem {
  imageSrc: string;
  keyword: string;
  minPairs?: number; // Số cặp tối thiểu cho item này
}

export interface GameData {
  items: GameItem[];
  minPairs?: number; // Tổng số cặp tối thiểu
  cardBackImage?: string;
}

export interface GameState {
  cards: CardItem[];
  selectedCardId: string | null;
  lockBoard: boolean;
  matchedCount: number;
  totalPairs: number;
  message: { type: "success" | "error" | null; text: string };
}
