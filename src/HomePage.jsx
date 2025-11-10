import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

function HomePage() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [handDetected, setHandDetected] = useState(false);
  const [waveCount, setWaveCount] = useState(0);
  const videoRef = useRef(null);
  const [handLandmarker, setHandLandmarker] = useState(null);
  const animationFrame = useRef(null);
  const lastWaveTime = useRef(0);
  const [cameraAvailable, setCameraAvailable] = useState(true);

  useEffect(() => {
    const initHandTracking = async () => {
      // Small delay to ensure other components release camera
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        setHandLandmarker(landmarker);

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setCameraAvailable(true);
          };
        }
      } catch (error) {
        console.log('Camera unavailable - click to enter instead');
        setCameraAvailable(false);
      }
    };

    initHandTracking();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!handLandmarker || !videoRef.current || !cameraAvailable) return;

    let isRunning = true;

    const detectWave = async () => {
      if (!isRunning) return;

      const video = videoRef.current;

      if (video && video.readyState >= 2) {
        try {
          const results = handLandmarker.detectForVideo(video, performance.now());
          
          if (results.landmarks && results.landmarks.length > 0) {
            const now = Date.now();
            if (now - lastWaveTime.current > 500) {
              setHandDetected(true);
              setWaveCount(prev => prev + 1);
              lastWaveTime.current = now;
            }
          } else {
            setHandDetected(false);
          }
        } catch (error) {
          console.error('Detection error:', error);
        }
      }

      if (isRunning) {
        animationFrame.current = requestAnimationFrame(detectWave);
      }
    };

    detectWave();

    return () => {
      isRunning = false;
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [handLandmarker, cameraAvailable, waveCount]);

  useEffect(() => {
    if (waveCount >= 2) {
      navigate('/canvas');
    }
  }, [waveCount, navigate]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      if (Math.random() > 0.7) {
        const newParticle = {
          id: Date.now() + Math.random(),
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 10 + 5,
          color: ['#3b82f6', '#8b5cf6', '#ec4899', '#22c55e', '#facc15'][Math.floor(Math.random() * 5)],
        };
        setParticles(prev => [...prev.slice(-30), newParticle]);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.slice(1));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleEnterCanvas = () => {
    navigate('/canvas');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <video ref={videoRef} className="hidden" autoPlay playsInline muted />

      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'gridScroll 20s linear infinite'
        }}></div>
      </div>

      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none animate-fadeOut"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}

      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full opacity-20 blur-3xl animate-float"></div>
      <div className="absolute bottom-40 right-32 w-48 h-48 bg-purple-500 rounded-full opacity-20 blur-3xl animate-float-delayed"></div>
      <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-pink-500 rounded-full opacity-20 blur-3xl animate-float-slow"></div>

      <div className="relative z-10 flex flex-col items-center h-full text-white px-4">
        <div className="mt-12 mb-16 text-center animate-scaleIn">
          <h1 className="text-7xl md:text-8xl font-black tracking-wider mb-4" style={{
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #22c55e, #facc15)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientShift 3s ease infinite',
          }}>
            ✨ Air Canvas
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 animate-fadeInUp">
            Draw in the air with your hands. No pen needed.
          </p>
        </div>

        <div className="flex-grow flex items-center justify-center relative w-full">
          <div className="absolute left-8 md:left-20 top-1/2 transform -translate-y-1/2 flex flex-col gap-12">
            <div className="flex flex-col items-center animate-fadeInUp">
              <div className="text-4xl md:text-5xl mb-3">🎨</div>
              <p className="text-sm md:text-base text-gray-300 font-medium">6 Colors</p>
            </div>
            <div className="flex flex-col items-center animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl md:text-5xl mb-3">✋</div>
              <p className="text-sm md:text-base text-gray-300 font-medium">Hand Tracking</p>
            </div>
          </div>

          <div className="relative">
            <div 
              className="relative w-80 h-80 rounded-full border-4 border-blue-500 flex items-center justify-center cursor-pointer transition-all duration-500 hover:scale-110 hover:border-purple-500 hover:shadow-2xl"
              onClick={handleEnterCanvas}
              style={{
                boxShadow: '0 0 60px rgba(59, 130, 246, 0.4), inset 0 0 60px rgba(59, 130, 246, 0.2)',
              }}
            >
              <div className="absolute inset-0 rounded-full border-4 border-purple-500 animate-ping opacity-20"></div>
              <div className="absolute inset-4 rounded-full border-4 border-pink-500 animate-ping opacity-20" style={{ animationDelay: '0.3s' }}></div>
              
              <div className="text-center z-10">
                <div className={`text-6xl mb-4 ${handDetected ? 'animate-wave' : ''}`}>
                  {handDetected ? '👋' : '✋'}
                </div>
                <p className="text-2xl font-bold mb-2">
                  {cameraAvailable && waveCount > 0 ? `Wave ${waveCount}/2` : 'Click to Enter'}
                </p>
                <p className="text-sm text-gray-400">
                  {cameraAvailable ? 'or wave your hand' : 'wave feature loading...'}
                </p>
              </div>

              <div className="absolute inset-0 rounded-full opacity-50" style={{
                background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #ec4899, #22c55e, #facc15, #3b82f6)',
                animation: 'rotate 4s linear infinite',
                WebkitMaskImage: 'radial-gradient(circle, transparent 95%, black 96%)',
                maskImage: 'radial-gradient(circle, transparent 95%, black 96%)',
              }}></div>
            </div>
          </div>

          <div className="absolute right-8 md:right-20 top-1/2 transform -translate-y-1/2 flex flex-col gap-12">
            <div className="flex flex-col items-center animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl md:text-5xl mb-3">💾</div>
              <p className="text-sm md:text-base text-gray-300 font-medium">Save Art</p>
            </div>
            <div className="flex flex-col items-center animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl md:text-5xl mb-3">🚀</div>
              <p className="text-sm md:text-base text-gray-300 font-medium">No Install</p>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <p className="text-center text-gray-400 text-sm animate-bounce">
            Move your mouse to see particle trails ✨
          </p>
        </div>
      </div>

      <div 
        className="absolute w-8 h-8 rounded-full bg-white mix-blend-difference pointer-events-none transition-all duration-100 ease-out"
        style={{
          left: mousePos.x - 16,
          top: mousePos.y - 16,
          boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
        }}
      ></div>
    </div>
  );
}

export default HomePage;
