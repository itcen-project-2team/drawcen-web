import React, { useRef, useEffect, useState } from 'react';
import styles from './Canvas.module.css';
import webSocketService from '../../utils/websocket';

const Canvas = ({ isQuizMaster, answer, timePercent, gameId, turnInfo }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [history, setHistory] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 캔버스 크기 설정
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // 실제 표시 크기
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      // 내부 해상도 (고해상도 지원)
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctxRef.current = ctx;
      drawBackground();
    };

    // 초기 설정
    resizeCanvas();
    
    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // 다른 사용자의 그림 데이터를 받아서 처리하는 이벤트 리스너
  useEffect(() => {
    const handleDrawReceived = (event) => {
      const drawData = event.detail;
      console.log('📨 Canvas에서 drawReceived 이벤트 수신:', drawData);
      
      if (drawData && drawData.points && drawData.points.length > 0) {
        console.log('✅ 유효한 그림 데이터 - 그리기 실행');
        drawReceivedStroke(drawData);
      } else if (drawData && drawData.color === "CLEAR_CANVAS") {
        console.log('🗑️ 지우기 명령 수신');
        drawReceivedStroke(drawData);
      } else {
        console.warn('⚠️ 유효하지 않은 그림 데이터:', drawData);
      }
    };

    console.log('📡 drawReceived 이벤트 리스너 등록');
    window.addEventListener('drawReceived', handleDrawReceived);
    
    return () => {
      console.log('📡 drawReceived 이벤트 리스너 제거');
      window.removeEventListener('drawReceived', handleDrawReceived);
    };
  }, []);

  // 다른 사용자의 그림을 캔버스에 그리는 함수
  const drawReceivedStroke = (drawData) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    
    if (!ctx || !canvas) return;

    // 지우기 명령 처리
    if (drawData.color === "CLEAR_CANVAS") {
      console.log('🗑️ 다른 사용자가 캔버스 지우기');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      setHistory([]);
      return;
    }

    if (!drawData.points || drawData.points.length < 2) return;

    const rect = canvas.getBoundingClientRect();

    ctx.beginPath();
    ctx.strokeStyle = drawData.color || '#000000';
    ctx.lineWidth = drawData.width || 2;
    
    // 스케일링된 좌표를 상대 좌표로 변환 후 절대 좌표로 변환
    const absolutePoints = drawData.points.map(point => ({
      x: (point.x / 10000) * rect.width,
      y: (point.y / 10000) * rect.height
    }));
    
    // 첫 번째 점으로 이동
    ctx.moveTo(absolutePoints[0].x, absolutePoints[0].y);
    
    // 나머지 점들을 연결
    for (let i = 1; i < absolutePoints.length; i++) {
      ctx.lineTo(absolutePoints[i].x, absolutePoints[i].y);
    }
    
    ctx.stroke();
    ctx.closePath();

    console.log('🎨 그림 그리기 완료 (좌표 변환):', {
      originalPoints: drawData.points.slice(0, 2),
      convertedPoints: absolutePoints.slice(0, 2),
      canvasSize: { width: rect.width, height: rect.height }
    });
  };

  // 그림 데이터를 서버로 전송하는 함수
  const sendDrawData = (points) => {
    console.log('📤 sendDrawData 호출:', { 
      gameId, 
      turnId: turnInfo?.turnId, 
      isQuizMaster, 
      pointsLength: points.length 
    });

    if (!gameId) {
      console.error('❌ gameId가 없습니다:', gameId);
      return;
    }

    if (!turnInfo?.turnId) {
      console.error('❌ turnId가 없습니다:', turnInfo?.turnId);
      return;
    }

    if (!isQuizMaster) {
      console.error('❌ 출제자가 아닙니다:', isQuizMaster);
      return;
    }

    if (points.length < 2) {
      console.warn('⚠️ 점이 너무 적습니다:', points.length);
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // 백엔드 API에 맞는 형식으로 변환 (절대 좌표를 상대 좌표로)
    const drawData = {
      turnId: turnInfo.turnId,
      color: color,
      width: lineWidth,
      points: points.map(point => ({ 
        // 상대 좌표를 10000배 스케일링 (백엔드 int 타입 대응)
        x: Math.round((point.x / rect.width) * 10000),
        y: Math.round((point.y / rect.height) * 10000)
      }))
    };

    console.log('📤 그림 데이터 전송 시도:', drawData);

    const success = webSocketService.sendDraw(gameId, drawData);
    console.log('📤 전송 결과:', success ? '성공' : '실패');
  };

  // 캔버스 지우기를 서버로 전송하는 함수
  const sendClearCanvas = () => {
    if (!gameId || !turnInfo?.turnId || !isQuizMaster) {
      return;
    }

    // 지우기는 특별한 DrawDto로 전송
    const clearData = {
      turnId: turnInfo.turnId,
      color: "CLEAR_CANVAS", // 특별한 색상 코드로 지우기 신호
      width: 0,
      points: []
    };

    console.log('🗑️ 캔버스 지우기 전송:', clearData);
    webSocketService.sendDraw(gameId, clearData);
  };

  const drawBackground = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const { width, height } = rect;
    
    ctx.save();
    ctx.fillStyle = '#ffffff';
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

  // 마우스 좌표를 캔버스 좌표로 변환하는 함수
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (!isQuizMaster) return; // 출제자만 그림을 그릴 수 있음
    
    console.log('🎨 그리기 시작 - 출제자 확인:', { isQuizMaster, gameId, turnId: turnInfo?.turnId });
    
    const coords = getCanvasCoordinates(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(coords.x, coords.y);
    ctxRef.current.strokeStyle = color;
    ctxRef.current.lineWidth = lineWidth;
    setIsDrawing(true);
    setCurrentStroke([{ x: coords.x, y: coords.y, color, lineWidth }]);
  };

  const draw = (e) => {
    if (!isDrawing || !isQuizMaster) return;
    
    const coords = getCanvasCoordinates(e);
    ctxRef.current.lineTo(coords.x, coords.y);
    ctxRef.current.stroke();
    setCurrentStroke(prev => [...prev, { x: coords.x, y: coords.y, color, lineWidth }]);
  };

  const handleMouseLeave = () => {
    if (isDrawing && currentStroke.length > 1) {
      // 현재 스트로크를 히스토리에 저장하고 서버로 전송
      setHistory(prev => [...prev, currentStroke]);
      sendDrawData(currentStroke);
      ctxRef.current.closePath();
      setCurrentStroke([]);
      // isDrawing은 true로 유지해서 다시 들어왔을 때 이어서 그릴 수 있도록
    }
  };

  const handleMouseEnter = (e) => {
    if (isDrawing && isQuizMaster) {
      // 새로운 스트로크 시작
      const coords = getCanvasCoordinates(e);
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(coords.x, coords.y);
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth = lineWidth;
      setCurrentStroke([{ x: coords.x, y: coords.y, color, lineWidth }]);
    }
  };

  const stopDrawing = () => {
    console.log('🎨 그리기 종료:', { strokeLength: currentStroke.length, isQuizMaster });
    
    if (currentStroke.length > 1) {
      setHistory(prev => [...prev, currentStroke]);
      // 스트로크가 완료되면 서버로 전송
      console.log('📤 스트로크 완료 - 서버로 전송 시도');
      sendDrawData(currentStroke);
    }
    ctxRef.current.closePath();
    setIsDrawing(false);
    setCurrentStroke([]);
  };

  const redrawCanvas = (strokes) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    ctx.clearRect(0, 0, rect.width, rect.height);
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
    if (history.length === 0 || !isQuizMaster) return;
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    redrawCanvas(newHistory);
  };

  const handleClear = () => {
    if (!isQuizMaster) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const rect = canvas.getBoundingClientRect();
    
    ctx.clearRect(0, 0, rect.width, rect.height);
    drawBackground();
    setHistory([]);
    sendClearCanvas();
  };

  return (
    <div className={styles.canvasArea}>
      {/* 캔버스 카드 배경 */}
      <div className={styles.canvasCard}></div>
      
      {/* 상단 반투명 도구 모음 - 모든 플레이어에게 표시 */}
      <div className={styles.canvasToolbar}>
        <div className={styles.toolGroup}>
          <label className={styles.colorTool}>
            <span>🎨</span>
            <input 
              type="color" 
              value={color} 
              onChange={e => setColor(e.target.value)}
              className={styles.colorInput}
              disabled={!isQuizMaster}
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
              disabled={!isQuizMaster}
            />
            <span className={styles.lineWidthDisplay}>{lineWidth}px</span>
          </label>
        </div>
        <div className={styles.actionGroup}>
          <button 
            onClick={handleUndo} 
            disabled={history.length === 0 || !isQuizMaster}
            className={styles.toolButton}
          >
            <span className={styles.buttonIcon}>↩️</span>
            <span className={styles.buttonText}>되돌리기</span>
          </button>
          <button 
            onClick={handleClear}
            disabled={!isQuizMaster}
            className={styles.toolButton}
          >
            <span className={styles.buttonIcon}>🗑️</span>
            <span className={styles.buttonText}>지우기</span>
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
          style={{ 
            cursor: isQuizMaster ? 'crosshair' : 'default',
            pointerEvents: isQuizMaster ? 'auto' : 'none'
          }}
        />
      </div>
      
      <div className={styles.timeBarBg}>
        <div className={styles.timeBar} style={{ width: `${timePercent}%` }} />
      </div>
    </div>
  );
};

export default Canvas; 