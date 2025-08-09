import React, { useRef, useState, useEffect } from 'react';
import './App.css';

// --- Type Definitions ---
interface TextAnnotation {
  type: 'text';
  text: string;
  x: number;
  y: number;
}

interface RectangleAnnotation {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
}

type Annotation = TextAnnotation | RectangleAnnotation;
type Tool = 'select' | 'text' | 'rect';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  // State for drawing rectangles
  const [isDrawing, setIsDrawing] = useState(false);
  const [startCoords, setStartCoords] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<RectangleAnnotation | null>(null);

  // Redraw canvas when image, annotations, or the current drawing rect change
  useEffect(() => {
    redrawCanvas();
  }, [image, annotations, currentRect]);

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext('2d') : null;
  };

  const getMousePos = (event: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const redrawCanvas = () => {
    const ctx = getCanvasContext();
    if (!ctx || !canvasRef.current) return;
    const canvas = canvasRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (image) {
      const aspectRatio = image.width / image.height;
      canvas.width = 800;
      canvas.height = canvas.width / aspectRatio;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    } else {
      // If no image, ensure canvas is blank and has default size
      canvas.width = 800;
      canvas.height = 600;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Draw all finalized annotations
    annotations.forEach((ann) => {
      if (ann.type === 'text') {
        ctx.font = '24px sans-serif';
        ctx.fillStyle = 'red';
        ctx.fillText(ann.text, ann.x, ann.y);
      } else if (ann.type === 'rect') {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
      }
    });

    // Draw the rectangle currently being drawn
    if (currentRect) {
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setAnnotations([]); // Clear annotations for new image
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(event);
    if (!pos || activeTool !== 'rect') return;

    setIsDrawing(true);
    setStartCoords(pos);
    setCurrentRect({ type: 'rect', x: pos.x, y: pos.y, width: 0, height: 0 });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startCoords || activeTool !== 'rect') return;
    const pos = getMousePos(event);
    if (!pos) return;

    const width = pos.x - startCoords.x;
    const height = pos.y - startCoords.y;
    setCurrentRect({ type: 'rect', x: startCoords.x, y: startCoords.y, width, height });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentRect || activeTool !== 'rect') return;

    const normalizedRect = {
        ...currentRect,
        x: currentRect.width < 0 ? currentRect.x + currentRect.width : currentRect.x,
        y: currentRect.height < 0 ? currentRect.y + currentRect.height : currentRect.y,
        width: Math.abs(currentRect.width),
        height: Math.abs(currentRect.height),
    };

    if(normalizedRect.width > 0 || normalizedRect.height > 0) {
        setAnnotations([...annotations, normalizedRect]);
    }

    setIsDrawing(false);
    setStartCoords(null);
    setCurrentRect(null);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'text' || isDrawing) return;

    const pos = getMousePos(event);
    if(!pos) return;

    const text = prompt('追加するテキストを入力してください:');
    if (!text) return;

    setAnnotations([...annotations, { type: 'text', text, x: pos.x, y: pos.y }]);
  };

  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) {
      alert("保存する画像がありません。");
      return;
    }

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if(!tempCtx) return;

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);

    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'edited-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>画像編集アプリ</h1>
      </header>
      <main>
        <div className="toolbar">
          <input type="file" accept="image/jpeg" onChange={handleImageUpload} />
          <button onClick={() => setActiveTool('text')} style={{ backgroundColor: activeTool === 'text' ? '#cce5ff' : '' }}>
            テキスト追加
          </button>
          <button onClick={() => setActiveTool('rect')} style={{ backgroundColor: activeTool === 'rect' ? '#cce5ff' : '' }}>
            矩形を追加
          </button>
          <button onClick={handleSaveImage}>保存</button>
        </div>
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            width="800"
            height="600"
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          ></canvas>
        </div>
      </main>
    </div>
  );
}

export default App;
