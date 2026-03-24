// src/components/WordDisplay.tsx
import React, { useEffect, useState } from 'react';
import type { WordData } from '../types/game.types';

interface WordDisplayProps {
  currentWord: WordData;
  currentProgress: string[];
  score: number;
  level: number;
  totalWords: number;
}

const WordDisplay: React.FC<WordDisplayProps> = ({ 
  currentWord,
  currentProgress,
  score,
  level,
  totalWords
}) => {
  const [wordImage, setWordImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = currentWord.imageUrl;
    img.onload = () => setWordImage(img);
  }, [currentWord]);

  const wordProgress = (currentProgress.filter(l => l !== '_').length / currentWord.word.length) * 100;

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px 25px',
      borderRadius: '16px',
      marginBottom: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      width: '1200px',
      boxSizing: 'border-box'
    }}>
      {/* Thanh tiến trình và điểm */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <div style={{
          flex: 1,
          height: '6px',
          background: '#e0e0e0',
          borderRadius: '3px',
          overflow: 'hidden',
          marginRight: '20px'
        }}>
          <div style={{
            width: `${wordProgress}%`,
            height: '100%',
            background: '#667eea',
            borderRadius: '3px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        <div style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#764ba2',
          background: '#f3e8ff',
          padding: '4px 16px',
          borderRadius: '20px'
        }}>
          {score}
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '25px',
        alignItems: 'center'
      }}>
        {/* Hình ảnh */}
        <div style={{
          width: '140px',
          height: '140px',
          border: '2px solid #667eea',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {wordImage ? (
            <img 
              src={wordImage.src} 
              alt="hình minh họa"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{ color: '#999' }}>...</div>
          )}
        </div>

        {/* Khu vực ô chữ */}
        <div style={{ 
          flex: 1,
          minWidth: 0
        }}>
          {/* Hàng ô chữ */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            {currentProgress.map((letter, index) => (
              <div key={index} style={{
                width: '70px',
                height: '70px',
                border: '2px solid #667eea',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: 'bold',
                backgroundColor: letter !== '_' ? '#f0f7ff' : '#fafafa',
                color: '#333',
                transition: 'all 0.2s ease',
                boxShadow: letter !== '_' ? '0 2px 8px rgba(102, 126, 234, 0.2)' : 'none'
              }}>
                {letter}
              </div>
            ))}
          </div>
          
          {/* Hint to hơn */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '0 5px'
          }}>
            <span style={{
              fontSize: '24px',           // Tăng từ 16px lên 24px
              color: '#2c3e50',
              fontWeight: '500',
              fontStyle: 'italic',
              background: '#f0f7ff',
              padding: '10px 30px',        // Tăng padding
              borderRadius: '40px',         // Bo tròn hơn
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
              border: '1px solid #e0e7ff'
            }}>
              {currentWord.hint}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordDisplay;