import { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

function AirCanvas() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const [handLandmarker, setHandLandmarker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState('Idle');
  const [drawColor, setDrawColor] = useState({ r: 59, g: 130, b: 246 });
  const [brushSize, setBrushSize] = useState(18);
  const [selectedTool, setSelectedTool] = useState('Blue');
  const [isEraser, setIsEraser] = useState(false);
  const prevPoint = useRef(null);
  const animationFrame = useRef(null);
  const lastColorChange = useRef(0);

  const colors = [
    { name: 'Blue', color: { r: 59, g: 130, b: 246 } },
    { name: 'Green', color: { r: 34, g: 197, b: 94 } },
    { name: 'Red', color: { r: 239, g: 68, b: 68 } },
    { name: 'Purple', color: { r: 168, g: 85, b: 247 } },
    { name: 'Yellow', color: { r: 250, g: 204, b: 21 } },
    { name: 'Eraser', color: { r: 40, g: 40, b: 40 } },
  ];

  useEffect(() => {
    const initializeHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.7,
          minHandPresenceConfidence: 0.7,
          minTrackingConfidence: 0.7,
        });
        setHandLandmarker(landmarker);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing HandLandmarker:', error);
        setIsLoading(false);
      }
    };

    initializeHandLandmarker();
  }, []);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
        alert('Please allow camera access to use Air Canvas');
      }
    };

    startWebcam();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!handLandmarker || !videoRef.current) return;

    const detectHands = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const drawCanvas = drawCanvasRef.current;

      if (!video || !canvas || !drawCanvas || video.readyState < 2) {
        animationFrame.current = requestAnimationFrame(detectHands);
        return;
      }

      const ctx = canvas.getContext('2d');
      const drawCtx = drawCanvas.getContext('2d');

      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        drawCanvas.width = video.videoWidth;
        drawCanvas.height = video.videoHeight;
      }

      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      const startTimeMs = performance.now();
      const results = handLandmarker.detectForVideo(video, startTimeMs);

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        
        const indexTip = landmarks[8];
        const indexPip = landmarks[6];
        const middleTip = landmarks[12];
        const middlePip = landmarks[10];

        const x = (1 - indexTip.x) * canvas.width;
        const y = indexTip.y * canvas.height;

        const indexUp = indexTip.y < indexPip.y;
        const middleUp = middleTip.y < middlePip.y;

        landmarks.forEach((landmark, idx) => {
          const lx = (1 - landmark.x) * canvas.width;
          const ly = landmark.y * canvas.height;
          ctx.beginPath();
          ctx.arc(lx, ly, idx === 8 ? 10 : 5, 0, 2 * Math.PI);
          ctx.fillStyle = idx === 8 ? 'rgba(255, 0, 0, 0.9)' : 'rgba(100, 255, 200, 0.7)';
          ctx.fill();
        });

        let interactedWithUI = false;

        const sliderX = canvas.width - 100;
        const sliderTop = 150;
        const sliderBottom = 550;
        const sliderWidth = 60;
        
        if (x >= sliderX && x <= sliderX + sliderWidth && y >= sliderTop && y <= sliderBottom) {
          const percentage = (y - sliderTop) / (sliderBottom - sliderTop);
          const size = Math.round(60 - (percentage * 55));
          setBrushSize(Math.max(5, Math.min(60, size)));
          prevPoint.current = null;
          setMode('Size Adjust');
          interactedWithUI = true;
        }
        
        const buttonTop = 96;
        const buttonBottom = 160;
        const buttonWidth = 130;
        const gap = 20;
        const startX = 50;
        
        if (!interactedWithUI && y >= buttonTop && y <= buttonBottom) {
          const now = Date.now();
          if (now - lastColorChange.current > 300) {
            for (let i = 0; i < 7; i++) {
              const btnX1 = startX + (i * (buttonWidth + gap));
              const btnX2 = btnX1 + buttonWidth;
              
              if (x >= btnX1 && x <= btnX2) {
                if (i === 6) {
                  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
                } else {
                  const color = colors[i];
                  
                  if (color.name === 'Eraser') {
                    setIsEraser(true);
                    setSelectedTool('Eraser');
                  } else {
                    setIsEraser(false);
                    setSelectedTool(color.name);
                    setDrawColor({ ...color.color });
                  }
                  lastColorChange.current = now;
                }
                prevPoint.current = null;
                interactedWithUI = true;
                setMode('Select');
                break;
              }
            }
          }
        }

        if (!interactedWithUI) {
          if (indexUp && !middleUp) {
            setMode('Draw');
            if (prevPoint.current) {
              if (isEraser) {
                drawCtx.globalCompositeOperation = 'destination-out';
                drawCtx.strokeStyle = 'rgba(0,0,0,1)';
                drawCtx.lineWidth = 60;
              } else {
                drawCtx.globalCompositeOperation = 'source-over';
                drawCtx.strokeStyle = `rgb(${drawColor.r}, ${drawColor.g}, ${drawColor.b})`;
                drawCtx.lineWidth = brushSize;
              }
              drawCtx.lineCap = 'round';
              drawCtx.lineJoin = 'round';
              drawCtx.beginPath();
              drawCtx.moveTo(prevPoint.current.x, prevPoint.current.y);
              drawCtx.lineTo(x, y);
              drawCtx.stroke();
            }
            prevPoint.current = { x, y };
          } else {
            setMode('Select');
            prevPoint.current = null;
          }
        }
      } else {
        setMode('Idle');
        prevPoint.current = null;
      }

      animationFrame.current = requestAnimationFrame(detectHands);
    };

    detectHands();

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [handLandmarker, drawColor, brushSize, isEraser]);

  const handleClearCanvas = () => {
    const drawCanvas = drawCanvasRef.current;
    if (drawCanvas) {
      const ctx = drawCanvas.getContext('2d');
      ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    }
  };

  const handleSaveCanvas = () => {
    const drawCanvas = drawCanvasRef.current;
    if (drawCanvas) {
      const link = document.createElement('a');
      link.download = 'air-canvas-drawing.png';
      link.href = drawCanvas.toDataURL();
      link.click();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-400 mx-auto mb-6"></div>
          <h1 className="text-4xl font-bold mb-2">Air Canvas</h1>
          <p className="text-xl text-gray-300">Loading magic...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-gray-900 overflow-hidden">
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      <canvas ref={drawCanvasRef} className="absolute top-0 left-0 w-full h-full opacity-70" />

      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 pointer-events-none z-50">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-10 py-3 rounded-full shadow-2xl">
          <h1 className="text-3xl font-black tracking-wider flex items-center gap-2">
            <span className="text-4xl">✨</span>
            <span style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>Air Canvas</span>
          </h1>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-24 left-12 flex gap-5">
          {colors.map((color) => (
            <div
              key={color.name}
              className={`w-32 h-16 rounded-2xl shadow-xl flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                selectedTool === color.name ? 'ring-4 ring-white scale-110' : ''
              }`}
              style={{
                backgroundColor: `rgb(${color.color.r}, ${color.color.g}, ${color.color.b})`,
                color: color.name === 'Eraser' ? 'white' : 'black',
              }}
            >
              {color.name}
            </div>
          ))}
          <button
            onClick={handleClearCanvas}
            className="w-32 h-16 rounded-2xl shadow-xl bg-gray-700 text-white font-bold hover:bg-gray-600 transition-all pointer-events-auto"
          >
            Clear
          </button>
        </div>

        <div className="absolute right-20 top-32">
          <p className="text-white text-sm font-bold mb-2 text-center drop-shadow-lg">BRUSH SIZE</p>
          <div className="w-12 h-96 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full relative shadow-2xl border-2 border-gray-600">
            <div
              className="absolute w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full left-1/2 transform -translate-x-1/2 shadow-lg flex items-center justify-center transition-all duration-100"
              style={{
                top: `calc(${((60 - brushSize) / 55) * 100}% - 20px)`,
              }}
            >
              <span className="text-xs font-bold text-white">{brushSize}</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 left-0 right-0 bg-gradient-to-r from-black via-gray-900 to-black bg-opacity-80 backdrop-blur-sm py-4 px-8 flex items-center justify-between border-t-2 border-gray-700">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full shadow-lg transition-all ${
                mode === 'Draw' 
                  ? 'bg-gradient-to-br from-green-400 to-green-600 animate-pulse' 
                  : mode === 'Select' 
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' 
                  : 'bg-gradient-to-br from-gray-500 to-gray-700'
              }`}
            />
            <span className="text-white text-xl font-bold drop-shadow-lg">MODE: {mode.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white text-lg font-semibold">TOOL: {selectedTool}</span>
            <div
              className="rounded-full border-4 border-white shadow-lg"
              style={{
                width: Math.max(brushSize + 10, 20),
                height: Math.max(brushSize + 10, 20),
                backgroundColor: `rgb(${drawColor.r}, ${drawColor.g}, ${drawColor.b})`,
              }}
            />
            <span className="text-white text-lg font-semibold">{brushSize}px</span>
          </div>
          <button
            onClick={handleSaveCanvas}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:scale-105 pointer-events-auto"
          >
            💾 Save Drawing
          </button>
        </div>
      </div>
    </div>
  );
}

export default AirCanvas;
