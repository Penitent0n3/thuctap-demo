import type { GameData } from "../types/objects";

const defaultGameData: GameData = {
  items: [
    { imageSrc: "🐶", keyword: "DOG", minPairs: 2 },
    { imageSrc: "🐱", keyword: "CAT", minPairs: 2 },
    { imageSrc: "🐭", keyword: "MOUSE", minPairs: 1 },
    { imageSrc: "🐹", keyword: "HAMSTER", minPairs: 1 },
    { imageSrc: "🐰", keyword: "RABBIT", minPairs: 1 },
    { imageSrc: "🦊", keyword: "FOX", minPairs: 1 },
    { imageSrc: "🐻", keyword: "BEAR", minPairs: 1 },
    { imageSrc: "🐼", keyword: "PANDA", minPairs: 1 },
  ],
  minPairs: 12,
  cardBackImage: "🎴",
};

// --- Dữ liệu mẫu ---
export const MY_APP_DATA: GameData =
  import.meta.env.PROD &&
  typeof window !== "undefined" &&
  (window as Window & typeof globalThis & { MY_APP_DATA: GameData })[
    "MY_APP_DATA"
  ]
    ? (
        window as Window &
          typeof globalThis & {
            MY_APP_DATA: GameData;
          }
      )["MY_APP_DATA"]
    : defaultGameData;
