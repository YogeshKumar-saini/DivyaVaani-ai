# 🕉️ Bhagavad Gita AI Assistant - Frontend

**Enterprise Spiritual Intelligence Platform**

A professional, modern web interface for the Bhagavad Gita AI Assistant, built with Next.js 15, TypeScript, and Tailwind CSS. This application provides an intuitive and elegant user experience for spiritual guidance powered by advanced AI.

## 🚀 Features

### ✨ Core Functionality
- **Real-time Chat Interface**: Seamless conversation with the AI spiritual guide
- **Multi-language Support**: Intelligent responses in English, Hindi, and other languages
- **Live Analytics Dashboard**: Real-time system metrics and performance monitoring
- **Response Caching**: Instant answers for frequently asked questions
- **User Feedback System**: Continuous improvement through user ratings

### 🎨 Professional Design
- **Modern UI/UX**: Clean, professional interface with enterprise-grade design
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Dark/Light Mode**: Automatic theme adaptation (expandable)
- **Smooth Animations**: Subtle transitions and loading states

### 📊 Analytics & Monitoring
- **Real-time Metrics**: Live tracking of queries, users, and performance
- **Popular Questions**: Dynamic ranking of frequently asked questions
- **System Health**: Real-time status monitoring and uptime tracking
- **Performance Insights**: Response time analytics and cache hit ratios

### 🔧 Technical Excellence
- **TypeScript**: Full type safety and enhanced developer experience
- **Next.js 15**: Latest React framework with App Router
- **Tailwind CSS**: Utility-first styling with custom design system
- **shadcn/ui**: High-quality, accessible component library
- **Error Boundaries**: Graceful error handling and recovery

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Hooks
- **API Communication**: Fetch API with proper error handling
- **Build Tool**: Turbopack (Next.js built-in)

## 📦 Installation

### Prerequisites
- Node.js 18.17 or later
- npm or yarn package manager
- Running backend API server (see main project README)

### Setup
```bash
# Clone the repository
cd frontend/

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

### Environment Configuration
```env
# Server-side only (used by app/api/[...path]/route.ts proxy)
BACKEND_URL=http://localhost:8000

# Client-safe values
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

Env precedence in local dev:
1. `.env.local`
2. `.env`

Production:
1. Runtime environment variable `BACKEND_URL` (Vercel or container env)
2. `.env.production` for build-time `NEXT_PUBLIC_*` values only

## 🚀 Usage

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Production Deployment
```bash
# Build the application
npm run build

# Start production server
npm run start
```

The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx          # Main application page
│   └── globals.css       # Global styles
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
├── .env.local           # Environment variables
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## 🎯 Key Components

### Chat Interface
- Real-time messaging with the AI assistant
- Message history with timestamps
- Scriptural reference highlighting
- Loading states and error handling

### Analytics Dashboard
- Live metrics display
- Popular questions tracking
- System health monitoring
- Performance insights

### User Experience
- Intuitive navigation and controls
- Responsive design for all devices
- Accessibility features
- Professional branding and messaging

## 🔧 Configuration

### API Integration
The frontend communicates with the backend API through REST endpoints:
- Browser calls `POST /api/text`, `GET /api/analytics`, etc.
- Next.js proxy route `app/api/[...path]/route.ts` forwards to `BACKEND_URL`
- Backend endpoints stay server-side and are never exposed as raw browser URLs

### Customization
- **Branding**: Update colors and logos in `app/layout.tsx`
- **Backend target**: Configure `BACKEND_URL` in `.env.local` (local) or runtime env (prod)
- **UI Components**: Customize using Tailwind CSS classes
- **Analytics**: Enable/disable features via environment variables

## 📈 Performance

### Optimization Features
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js built-in image optimization
- **Caching**: Response caching for improved performance
- **Lazy Loading**: Components loaded on demand

### Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🤝 Contributing

### Development Guidelines
1. **TypeScript**: Strict type checking enabled
2. **ESLint**: Code quality and consistency
3. **Prettier**: Automatic code formatting
4. **Testing**: Component and integration tests

### Code Style
- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices
- Maintain accessibility standards

## 📄 License

This project is part of the Bhagavad Gita AI Assistant system. See the main project LICENSE file for details.

## 🙏 Acknowledgments

- **Bhagavad Gita**: Source of eternal spiritual wisdom
- **Open Source Community**: For the amazing tools and libraries
- **Contributors**: For their dedication to spiritual technology

---

**🕉️ May the wisdom of the Bhagavad Gita guide your journey toward self-realization and inner peace.**
