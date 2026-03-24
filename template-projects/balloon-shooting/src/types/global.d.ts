// src/types/global.d.ts
export interface WordData {
  word: string;
  imageUrl: string;
  hint: string;
}

declare global {
  interface Window {
    win: {
      DATA: WordData[];
    };
  }
}

export {};