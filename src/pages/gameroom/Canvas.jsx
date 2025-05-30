import React, { useRef, useEffect, useState } from 'react';
import styles from './Canvas.module.css';

const Canvas = ({ isQuizMaster, answer, timePercent }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [history, setHistory] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctxRef.current = ctx;
    drawBackground();
  }, []);

  const drawBackground = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const { width, height } = canvas;
    ctx.save();
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(200, 215, 255, 0.2)';
    ctx.lineWidth = 0.5;
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    ctx.restore();
  };

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    ctxRef.current.strokeStyle = color;
    ctxRef.current.lineWidth = lineWidth;
    setIsDrawing(true);
    setCurrentStroke([{ x: offsetX, y: offsetY, color, lineWidth }]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
    setCurrentStroke(prev => [...prev, { x: offsetX, y: offsetY, color, lineWidth }]);
  };

  const handleMouseLeave = () => {
    if (isDrawing && currentStroke.length > 1) {
      // 현재 스트로크를 히스토리에 저장하고 패스 종료
      setHistory(prev => [...prev, currentStroke]);
      ctxRef.current.closePath();
      setCurrentStroke([]);
      // isDrawing은 true로 유지해서 다시 들어왔을 때 이어서 그릴 수 있도록
    }
  };

  const handleMouseEnter = (e) => {
    if (isDrawing) {
      // 새로운 스트로크 시작
      const { offsetX, offsetY } = e.nativeEvent;
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(offsetX, offsetY);
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth = lineWidth;
      setCurrentStroke([{ x: offsetX, y: offsetY, color, lineWidth }]);
    }
  };

  const stopDrawing = () => {
    if (currentStroke.length > 1) {
      setHistory(prev => [...prev, currentStroke]);
    }
    ctxRef.current.closePath();
    setIsDrawing(false);
    setCurrentStroke([]);
  };

  const redrawCanvas = (strokes) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    strokes.forEach(stroke => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      ctx.strokeStyle = stroke[0].color;
      ctx.lineWidth = stroke[0].lineWidth;
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
      ctx.closePath();
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    redrawCanvas(newHistory);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    setHistory([]);
  };

  return (
    <div className={styles.canvasArea}>
      {/* 캔버스 카드 배경 */}
      <div className={styles.canvasCard}></div>
      
      {/* 상단 반투명 도구 모음 */}
      <div className={styles.canvasToolbar}>
        <div className={styles.toolGroup}>
          <label className={styles.colorTool}>
            <span>🎨</span>
            <input 
              type="color" 
              value={color} 
              onChange={e => setColor(e.target.value)}
              className={styles.colorInput}
            />
          </label>
          <label className={styles.brushTool}>
            <span>✏️</span>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={lineWidth} 
              onChange={e => setLineWidth(Number(e.target.value))}
              className={styles.rangeInput}
            />
            <span className={styles.lineWidthDisplay}>{lineWidth}px</span>
          </label>
        </div>
        <div className={styles.actionGroup}>
          <button 
            onClick={handleUndo} 
            disabled={history.length === 0}
            className={styles.toolButton}
          >
            ↩️ 되돌리기
          </button>
          <button 
            onClick={handleClear}
            className={styles.toolButton}
          >
            🗑️ 지우기
          </button>
        </div>
      </div>

      {isQuizMaster && (
        <div className={styles.answerBox}>
          정답: {answer}
        </div>
      )}
      
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </div>
      
      <div className={styles.timeBarBg}>
        <div className={styles.timeBar} style={{ width: `${timePercent}%` }} />
      </div>
    </div>
  );
};

export default Canvas; 