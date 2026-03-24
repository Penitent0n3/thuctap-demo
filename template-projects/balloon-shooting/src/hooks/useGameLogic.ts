// src/hooks/useGameLogic.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Bubble, GameState } from '../types/game.types';
import { WORDS, BUBBLE_IMAGES } from '../data/words';

const useGameLogic = (canvasSize: { width: number; height: number }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    currentWord: WORDS[0],
    currentProgress: Array(WORDS[0].word.length).fill('_'),
    score: 0,
    bubbles: [],
    gameOver: false,
    level: 1,
    totalWords: WORDS.length
  });
  
  // Dùng ref để tránh vòng lặp vô hạn
  const isResetting = useRef(false);

  // Lấy danh sách chữ còn cần điền
  const getRemainingLetters = useCallback(() => {
    const wordLetters = gameState.currentWord.word.split('');
    const remaining: string[] = [];
    
    wordLetters.forEach((letter, index) => {
      if (gameState.currentProgress[index] === '_') {
        remaining.push(letter);
      }
    });
    
    return remaining;
  }, [gameState.currentWord, gameState.currentProgress]);

  // Tạo pool chữ cái - chỉ gồm những chữ còn cần điền + chữ sai
  const getLetterPool = useCallback(() => {
    const remainingLetters = getRemainingLetters();
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    if (remainingLetters.length === 0) {
      return [];
    }
    
    const extraLetters = alphabet.split('').filter(l => !remainingLetters.includes(l));
    const pool: string[] = [];
    
    remainingLetters.forEach(letter => {
      pool.push(letter);
      pool.push(letter);
    });
    
    const shuffledExtra = [...extraLetters].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(3, shuffledExtra.length); i++) {
      pool.push(shuffledExtra[i]);
    }
    
    return pool;
  }, [getRemainingLetters]);

  // Kiểm tra va chạm giữa các bong bóng
  const checkCollision = useCallback((newBubble: Bubble, existingBubbles: Bubble[]): boolean => {
    const minDistance = 120;
    for (const bubble of existingBubbles) {
      const dx = newBubble.x - bubble.x;
      const dy = newBubble.y - bubble.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < minDistance) {
        return true;
      }
    }
    return false;
  }, []);

  // Tìm vị trí không va chạm
  const findNonCollidingPosition = useCallback((existingBubbles: Bubble[]): { x: number, y: number } => {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const newBubble = {
        x: Math.random() * (canvasSize.width - 140) + 70,
        y: canvasSize.height - 70,
        id: 'temp',
        letter: '',
        speed: 0,
        imageUrl: '',
        isPopped: false
      };
      
      if (!checkCollision(newBubble, existingBubbles)) {
        return { x: newBubble.x, y: newBubble.y };
      }
      attempts++;
    }
    
    return {
      x: Math.random() * (canvasSize.width - 140) + 70,
      y: canvasSize.height - 70
    };
  }, [canvasSize, checkCollision]);

  const createBubble = useCallback((): Bubble | null => {
    const letterPool = getLetterPool();
    
    if (letterPool.length === 0) {
      return null;
    }
    
    const randomLetter = letterPool[Math.floor(Math.random() * letterPool.length)];
    const randomImage = BUBBLE_IMAGES[Math.floor(Math.random() * BUBBLE_IMAGES.length)];
    
    const position = findNonCollidingPosition(gameState.bubbles.filter(b => !b.isPopped));

    return {
      id: Math.random().toString(36).substr(2, 9),
      letter: randomLetter,
      x: position.x,
      y: position.y,
      speed: 4 + Math.random() * 2,
      imageUrl: randomImage,
      isPopped: false
    };
  }, [gameState.bubbles, getLetterPool, findNonCollidingPosition]);

  const goToNextWord = useCallback(() => {
    if (!gameState.gameOver && currentWordIndex < WORDS.length - 1) {
      const nextIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextIndex);
      setGameState(prev => ({
        ...prev,
        currentWord: WORDS[nextIndex],
        currentProgress: Array(WORDS[nextIndex].word.length).fill('_'),
        bubbles: [],
        level: prev.level + 1
      }));
    } else if (currentWordIndex === WORDS.length - 1) {
      setGameState(prev => ({
        ...prev,
        gameOver: true
      }));
    }
  }, [currentWordIndex, WORDS, gameState.gameOver]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        if (prev.gameOver) return prev;

        let updatedBubbles = prev.bubbles
          .map(bubble => ({
            ...bubble,
            y: bubble.y - bubble.speed
          }))
          .map(bubble => {
            if (bubble.y < -60) {
              return { ...bubble, isPopped: true };
            }
            return bubble;
          })
          .filter(bubble => !bubble.isPopped);

        const remainingLetters = getRemainingLetters();
        
        if (remainingLetters.length > 0 && updatedBubbles.length < 8 && Math.random() < 0.15) {
          const newBubble = createBubble();
          if (newBubble) {
            updatedBubbles.push(newBubble);
          }
        }

        return {
          ...prev,
          bubbles: updatedBubbles
        };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [createBubble, getRemainingLetters]);

  const shootBubble = useCallback((bubbleId: string, letter: string) => {
    setGameState(prev => {
      if (prev.gameOver) return prev;

      const currentWord = prev.currentWord.word;
      const currentProgress = [...prev.currentProgress];
      
      let targetIndex = -1;
      for (let i = 0; i < currentProgress.length; i++) {
        if (currentProgress[i] === '_') {
          targetIndex = i;
          break;
        }
      }
      
      const updatedBubbles = prev.bubbles
        .map(bubble =>
          bubble.id === bubbleId ? { ...bubble, isPopped: true } : bubble
        )
        .filter(bubble => !bubble.isPopped);

      if (targetIndex !== -1 && currentWord[targetIndex] === letter) {
        currentProgress[targetIndex] = letter;
        
        const isWordComplete = currentProgress.join('') === currentWord;
        
        if (isWordComplete) {
          setTimeout(() => {
            goToNextWord();
          }, 1000);
        }

        return {
          ...prev,
          currentProgress,
          bubbles: updatedBubbles,
          score: prev.score + 10
        };
      } else {
        return {
          ...prev,
          bubbles: updatedBubbles
        };
      }
    });
  }, [goToNextWord]);

  // Hàm reset game - bắt đầu lại từ đầu
  const resetGame = useCallback(() => {
    if (isResetting.current) return;
    isResetting.current = true;
    
    setCurrentWordIndex(0);
    setGameState({
      currentWord: WORDS[0],
      currentProgress: Array(WORDS[0].word.length).fill('_'),
      score: 0,
      bubbles: [],
      gameOver: false,
      level: 1,
      totalWords: WORDS.length
    });
    
    setTimeout(() => {
      isResetting.current = false;
    }, 100);
  }, [WORDS]);

  // Hàm restart game (reset và bắt đầu lại)
  const restartGame = useCallback(() => {
    resetGame();
  }, [resetGame]);

  return {
    bubbles: gameState.bubbles,
    currentWord: gameState.currentWord,
    currentProgress: gameState.currentProgress,
    score: gameState.score,
    gameOver: gameState.gameOver,
    level: gameState.level,
    totalWords: gameState.totalWords,
    remainingLetters: getRemainingLetters().length,
    shootBubble,
    resetGame,
    restartGame
  };
};

export default useGameLogic;