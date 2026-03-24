// src/types/game.types.ts
export interface Bubble {
  id: string;
  letter: string;
  x: number;
  y: number;
  speed: number;
  imageUrl: string;
  isPopped: boolean;
}

export interface WordData {
  word: string;
  imageUrl: string;
  hint: string;
}

export interface GameState {
  currentWord: WordData;
  currentProgress: string[];
  score: number;
  bubbles: Bubble[];
  gameOver: boolean;
  level: number;
  totalWords: number;
}