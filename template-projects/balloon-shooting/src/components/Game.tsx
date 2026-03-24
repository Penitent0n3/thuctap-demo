// src/components/Game.tsx
import React, { useEffect, useRef, useState } from 'react';
import WordDisplay from './WordDisplay';
import useGameLogic from '../hooks/useGameLogic';
import { BUBBLE_IMAGES } from '../data/words';

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  
  const canvasSize = { width: 1200, height: 700 };
  
  const {
    bubbles,
    currentWord,
    currentProgress,
    score,
    gameOver,
    level,
    totalWords,
    remainingLetters,
    shootBubble,
    resetGame  // Lấy hàm resetGame từ hook
  } = useGameLogic(canvasSize);

  useEffect(() => {
    const loadImages = async () => {
      const imageMap = new Map();
      
      for (const src of BUBBLE_IMAGES) {
        const img = new Image();
        img.src = src;
        await new Promise((resolve) => {
          img.onload = () => {
            imageMap.set(src, img);
            resolve(img);
          };
          img.onerror = () => {
            const defaultImg = new Image();
            defaultImg.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="55" fill="${src.includes('red') ? '%23FF6B6B' : '%234ECDC4'}"/></svg>`;
            imageMap.set(src, defaultImg);
            resolve(defaultImg);
          };
        });
      }
      
      setLoadedImages(imageMap);
    };

    loadImages();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    const canvas = canvasRef.current;
    canvas?.addEventListener('mousemove', handleMouseMove);
    return () => canvas?.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameOver) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const hitBubble = bubbles.find(bubble => {
      const dx = clickX - bubble.x;
      const dy = clickY - bubble.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < 55 && !bubble.isPopped;
    });

    if (hitBubble) {
      shootBubble(hitBubble.id, hitBubble.letter);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    bubbles.forEach(bubble => {
      if (!bubble.isPopped) {
        const img = loadedImages.get(bubble.imageUrl);
        
        if (img) {
          ctx.save();
          
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetY = 8;
          
          ctx.globalAlpha = 0.95;
          ctx.drawImage(img, bubble.x - 100, bubble.y - 100, 200, 200);
          
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          ctx.globalAlpha = 1;
          ctx.fillStyle = 'white';
          ctx.font = 'bold 28px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(bubble.letter, bubble.x , bubble.y - 20);
          
          ctx.restore();
        }
      }
    });

    ctx.shadowColor = 'transparent';
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(mousePos.x, mousePos.y, 30, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(mousePos.x, mousePos.y, 33, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.moveTo(mousePos.x - 40, mousePos.y);
    ctx.lineTo(mousePos.x - 18, mousePos.y);
    ctx.moveTo(mousePos.x + 18, mousePos.y);
    ctx.lineTo(mousePos.x + 40, mousePos.y);
    ctx.moveTo(mousePos.x, mousePos.y - 40);
    ctx.lineTo(mousePos.x, mousePos.y - 18);
    ctx.moveTo(mousePos.x, mousePos.y + 18);
    ctx.lineTo(mousePos.x, mousePos.y + 40);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.arc(mousePos.x, mousePos.y, 6, 0, Math.PI * 2);
    ctx.fill();

  }, [bubbles, mousePos, loadedImages]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      minHeight: '100vh',
      background: 'black'
    }}>
      <WordDisplay 
        currentWord={currentWord}
        currentProgress={currentProgress}
        score={score}
        level={level}
        totalWords={totalWords}
      />
      
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleCanvasClick}
        style={{ 
          border: '4px solid white', 
          cursor: 'none',
          borderRadius: '15px',
          boxShadow: '0 15px 30px rgba(0,0,0,0.4)'
        }}
      />
      
      {gameOver && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '60px',
          borderRadius: '30px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          textAlign: 'center',
          zIndex: 1000,
          minWidth: '500px',
          animation: 'slideIn 0.5s ease-out'
        }}>
          <h1 style={{ fontSize: '80px', marginBottom: '20px' }}>🏆</h1>
          <h2 style={{ 
            fontSize: '48px', 
            color: '#667eea', 
            marginBottom: '20px' 
          }}>
            CHIẾN THẮNG!
          </h2>
          <p style={{ 
            fontSize: '36px', 
            margin: '30px 0',
            color: '#764ba2',
            fontWeight: 'bold'
          }}>
            {score} điểm
          </p>
          <p style={{ 
            fontSize: '24px', 
            color: '#666', 
            marginBottom: '40px' 
          }}>
            Bạn đã hoàn thành {totalWords} từ!
          </p>
          <button 
            onClick={resetGame}  // THAY ĐỔI Ở ĐÂY: dùng resetGame thay vì reload
            style={{
              padding: '20px 60px',
              fontSize: '28px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              boxShadow: '0 10px 20px rgba(102, 126, 234, 0.4)',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            CHƠI LẠI
          </button>
        </div>
      )}

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translate(-50%, -30%);
              opacity: 0;
            }
            to {
              transform: translate(-50%, -50%);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Game;