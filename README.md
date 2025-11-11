# ✨ Air Canvas - Draw in the Air with Your Hands

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://your-deployed-url.vercel.app)
[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)](https://vitejs.dev/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Hand_Tracking-orange)](https://mediapipe.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> **Draw in the air with your hands. No pen needed.** A real-time computer vision drawing application powered by MediaPipe hand tracking and React.

## 🚀 Features

- ✋ **Hand Gesture Control** - Draw using just your index finger
- 🎨 **6 Vibrant Colors** - Blue, Green, Red, Purple, Yellow, and Eraser
- 📏 **Adjustable Brush Size** - Slide control for brush thickness (5-60px)
- 💾 **Save Your Art** - Export drawings as PNG files
- 🌐 **No Installation** - Works directly in your browser
- 🎭 **Real-Time Hand Tracking** - Powered by Google MediaPipe
- ✨ **Beautiful UI** - Modern gradient design with smooth animations
- 👋 **Interactive Landing Page** - Wave to enter or click

## 🎮 How to Use

### Drawing
1. **Hold up your index finger** (other fingers down) to draw
2. **Two fingers up** to select colors/tools
3. **Touch the color buttons** at the top to switch colors
4. **Use the right slider** to adjust brush size
5. **Click "Save Drawing"** to export your artwork

### Gesture Controls
- **Index finger up** = Draw mode
- **Hand away** = Selection mode
- **Touch color boxes** = Change color
- **Touch slider** = Adjust brush size

## 🛠️ Tech Stack

- **Frontend Framework:** React 18 with Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **Computer Vision:** MediaPipe Hands (Google)
- **Hand Tracking:** Real-time 21-point hand landmark detection
- **Canvas API:** HTML5 Canvas for drawing
- **Deployment:** Vercel

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Modern web browser with webcam
- HTTPS connection (required for camera access)

### Local Development
Clone the repository
git clone https://github.com/YOUR_USERNAME/air-canvas-web.git
cd air-canvas-web

Install dependencies
npm install

Start development server
npm run dev

Open http://localhost:5173 in your browser

### Build for Production
Create optimized production build
npm run build

Preview production build locally
npm run preview

## 🎨 Color Palette

| Color | RGB | Hex |
|-------|-----|-----|
| Blue | (59, 130, 246) | #3B82F6 |
| Green | (34, 197, 94) | #22C55E |
| Red | (239, 68, 68) | #EF4444 |
| Purple | (168, 85, 247) | #A855F7 |
| Yellow | (250, 204, 21) | #FACC15 |
| Eraser | (40, 40, 40) | #282828 |

## 🏗️ Project Structure

air-canvas-web/
├── src/
│ ├── components/
│ │ ├── HomePage.jsx # Landing page with hand wave detection
│ │ └── AirCanvas.jsx # Main drawing canvas component
│ ├── App.jsx # Router configuration
│ ├── App.css # Global styles
│ └── index.css # Tailwind imports & animations
├── public/ # Static assets
├── index.html # Entry HTML
├── package.json # Dependencies
├── vite.config.js # Vite configuration
└── tailwind.config.js # Tailwind configuration


## 🧠 How It Works

Air Canvas uses **Google MediaPipe Hands** to detect 21 hand landmarks in real-time:

1. **Camera Feed** → Webcam captures video at 1280x720
2. **Hand Detection** → MediaPipe identifies hand landmarks
3. **Gesture Recognition** → Tracks index fingertip position
4. **Canvas Rendering** → Draws lines based on finger movement
5. **UI Interaction** → Detects fingertip in button/slider zones

### Key Technical Features
- Real-time hand tracking at 30+ FPS
- Canvas overlay with opacity blending
- Debounced color switching to prevent accidental changes
- Eraser mode using `destination-out` composite operation
- Responsive design with mobile support

## 🌐 Browser Support

| Browser | Version | Camera Support |
|---------|---------|----------------|
| Chrome | 90+ | ✅ |
| Edge | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Opera | 76+ | ✅ |

**Note:** HTTPS required for webcam access in all browsers.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
   
## 🙏 Acknowledgments

- [Google MediaPipe](https://mediapipe.dev/) for hand tracking models
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the amazing development experience
- [Tailwind CSS](https://tailwindcss.com/) for rapid UI development
- Inspiration from virtual drawing applications and AR interfaces

## 📧 Contact

Bilal Irfan - [Portfolio](https://bilxl-irfan.github.io/)

Project Link: [https://github.com/bilxl-irfan/air-canvas-web](https://github.com/bilxl-irfan/air-canvas-web)

---

Made with ❤️ and ✨ by Bilal
