import type { Group, Item } from "../types/objects";

/**
 * Check if a string is a single emoji.
 * A single emoji is typically 1-2 grapheme clusters.
 * If it contains path characters (/ . \) or is too long, treat as path.
 */
export const isEmoji = (str: string): boolean => {
  // If it looks like a path, it's not an emoji
  if (str.includes("/") || str.includes(".") || str.includes("\\")) {
    return false;
  }

  // A single emoji is usually short (1-4 code points for most emojis including modifiers)
  // and doesn't look like a URL or path
  if (str.length > 10) {
    return false;
  }

  // Check if it contains emoji characters using Unicode property escapes
  const hasEmoji = /\p{Emoji}/u.test(str);

  return hasEmoji;
};
// Fisher-Yates shuffle algorithm
export const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};export const shuffleItems = (items: Item[]): Item[] => {
  return shuffleArray(items);
};
export const shuffleGroups = (groups: Group[]): Group[] => {
  return shuffleArray(groups);
};

