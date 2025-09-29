# 🎯 GeoCetak Web Platform

Platform Pembelajaran Geometri 3D Interaktif dengan fitur **"Interaktivitas Terpandu"** untuk bangun ruang sisi lengkung (Tabung, Kerucut, Bola).

![GeoCetak Preview](https://via.placeholder.com/800x400/4A90E2/FFFFFF?text=GeoCetak+3D+Learning+Platform)

## ✨ Features

### 🎮 Pembelajaran Interaktif
- **Interactive 3D Geometry**: Manipulasi real-time untuk Tabung, Kerucut, dan Bola
- **Net Animations**: Animasi jaring-jaring 3D → 2D yang smooth
- **Formula Discovery**: Siswa menemukan rumus melalui eksplorasi interaktif
- **Real-time Calculations**: Update rumus secara otomatis berdasarkan parameter

### 🎯 Gamifikasi
- **XP System**: Poin untuk setiap aktivitas pembelajaran
- **Badges & Achievements**: Sistem penghargaan visual
- **Progress Tracking**: Lacak kemajuan per modul dan lesson
- **Streak System**: Reward untuk konsistensi belajar

### 🔧 Fitur Teknis
- **React Three Fiber**: 3D rendering dengan performa tinggi
- **Supabase Backend**: Database, Auth, dan Real-time features
- **Material-UI**: Komponen UI modern dan responsif
- **TypeScript**: Type safety dan developer experience

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- Account Supabase (gratis di [supabase.com](https://supabase.com))

### 1. Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd geocetak-web

# Install dependencies
npm install
```

### 2. Setup Environment

Buat file `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

1. Buka Supabase dashboard
2. Buka **SQL Editor**
3. Jalankan script berikut:

```sql
-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Modules table
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES modules(id),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content JSONB,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Student progress
CREATE TABLE student_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    lesson_id INTEGER REFERENCES lessons(id),
    completed_at TIMESTAMP DEFAULT NOW(),
    score INTEGER,
    xp_earned INTEGER DEFAULT 0,
    UNIQUE(user_id, lesson_id)
);

-- User stats for gamification
CREATE TABLE user_stats (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    badges JSONB DEFAULT '[]'::jsonb,
    streak_days INTEGER DEFAULT 0,
    last_activity DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert initial modules
INSERT INTO modules (name, slug, description, order_index) VALUES
('Tabung', 'tabung', 'Pelajari konsep tabung, jaring-jaring, dan aplikasinya', 1),
('Kerucut', 'kerucut', 'Eksplorasi kerucut, garis pelukis, dan volume', 2),
('Bola', 'bola', 'Memahami bola, luas permukaan, dan simetri', 3);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own progress" ON student_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own stats" ON user_stats FOR ALL USING (auth.uid() = id);
```

### 4. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser.

---

## 🏗️ Project Structure

```
src/
├── components/
│   ├── layout/                 # Layout components
│   │   ├── DashboardLayout.tsx # Main app layout
│   │   └── ThreePanelLayout.tsx# Learning layout (3-panel)
│   ├── 3d/                     # 3D components
│   │   ├── Scene3D.tsx         # Main 3D scene wrapper
│   │   ├── geometries/         # Interactive geometries
│   │   │   ├── InteractiveCylinder.tsx
│   │   │   ├── InteractiveCone.tsx
│   │   │   └── InteractiveSphere.tsx
│   │   └── controls/           # 3D controls
│   │       ├── ParameterSliders.tsx
│   │       └── ViewControls.tsx
│   ├── learning/               # Learning components
│   │   ├── LessonContent.tsx   # Lesson content display
│   │   ├── FormulaPanel.tsx    # Dynamic formulas
│   │   └── ProgressTracker.tsx # Progress visualization
│   └── ui/                     # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Modal.tsx
├── pages/
│   ├── Dashboard.tsx           # Main dashboard
│   ├── LearningModule.tsx      # 3-panel learning interface
│   └── Login.tsx               # Authentication
├── stores/                     # Zustand stores
│   ├── authStore.ts           # Authentication state
│   ├── learningStore.ts       # Learning progress & 3D state
│   └── gameStore.ts           # Gamification state
├── services/
│   ├── supabase.ts            # Supabase client & types
│   └── api.ts                 # API functions
├── utils/
│   ├── mathHelpers.ts         # Mathematical calculations
│   ├── 3dHelpers.ts          # 3D utilities
│   └── constants.ts          # App constants
├── types/
│   └── index.ts              # TypeScript type definitions
└── App.tsx                   # Main app component
```

---

## 🎯 Key Features Implementation

### Three-Panel Learning Layout
```
┌─────────────────────────────────────────────────────────┐
│ GeoCetak | Module: Tabung                    👤 Profile │
├───────────────────────────────────────────────────────────┤
│ [📚 Learn] [🔄 Nets] [🎮 3D Create] [📊 Progress]      │
├─────────────┬─────────────────┬─────────────────────────┤
│             │                 │                         │
│ CONTENT     │ INTERACTIVE     │ FORMULA & RESULTS       │
│ PANEL       │ VIEWPORT        │ PANEL                   │
│             │                 │                         │
│ • Theory    │ • Live 3D       │ • Dynamic Formulas      │
│ • Steps     │ • Net Anim      │ • Calculations          │
│ • Context   │ • Controls      │ • Progress Tracking     │
│ • Video     │ • Tinkercad     │ • Achievements          │
│             │                 │                         │
└─────────────┴─────────────────┴─────────────────────────┘
```

### Interactive 3D Components

#### Cylinder Component
```typescript
function InteractiveCylinder() {
  const { geometryParams } = useLearningStore()
  
  return (
    <mesh>
      <cylinderGeometry 
        args={[geometryParams.radius, geometryParams.radius, geometryParams.height, 32]} 
      />
      <meshStandardMaterial color="#4A90E2" transparent opacity={0.8} />
    </mesh>
  )
}
```

#### Dynamic Formula Calculation
```typescript
// Auto-update formulas berdasarkan parameter
const surfaceArea = 2 * Math.PI * radius * (radius + height)
const volume = Math.PI * Math.pow(radius, 2) * height
```

### Gamification System
- **XP Calculation**: Dinamis berdasarkan performance
- **Level System**: 500 XP per level
- **Badges**: Achievement berdasarkan progress
- **Streak Tracking**: Daily login rewards

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run with UI
npm run test:ui

# Coverage report
npm run test:coverage
```

## 📦 Build & Deploy

### Local Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Type check
tsc --noEmit

# Lint code
npm run lint
```

### Deploy to Vercel

#### Option A: Deploy via GitHub (Recommended)
1. Push code to GitHub repository
2. Visit [vercel.com](https://vercel.com) and import your project
3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

#### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

#### Vercel Configuration
The project includes `vercel.json` with optimized settings:
- SPA routing support
- Asset caching headers
- Build optimization
- Environment variable mapping

#### Deploy Steps
1. **Prepare Environment**: Copy `.env.example` to `.env` and fill values
2. **Test Build**: Run `npm run build` locally to ensure no errors
3. **Deploy**: Use GitHub integration or Vercel CLI
4. **Configure Domain**: Set up custom domain if needed
5. **Monitor**: Check Vercel dashboard for deployment status

---

## 🛠️ Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier untuk formatting
- Functional components dengan hooks
- Proper error handling dan loading states

### Performance
- React.memo untuk expensive components
- useCallback untuk event handlers
- Lazy loading untuk 3D models
- Bundle size monitoring

### Testing
- Unit tests untuk business logic
- Component tests dengan React Testing Library
- E2E tests untuk critical flows

---

## 📚 Learning Modules

### 1. Tabung (Cylinder)
- ✅ Konsep dasar dan unsur-unsur
- ✅ Interactive 3D manipulation
- ✅ Jaring-jaring animation
- ✅ Formula discovery (L = 2πr(r + t))
- ✅ Volume calculation (V = πr²t)
- ⏳ Problem solving exercises

### 2. Kerucut (Cone)
- ⏳ Konsep garis pelukis
- ⏳ Pythagoras relationship
- ⏳ Net animation (sector + circle)
- ⏳ Surface area formula
- ⏳ Volume relationship dengan tabung

### 3. Bola (Sphere)
- ⏳ Symmetry exploration
- ⏳ Archimedes experiment
- ⏳ Surface area derivation
- ⏳ Volume formula discovery
- ⏳ Real-world applications

---

## 🔧 Configuration

### Environment Variables
```env
# Supabase (Required)
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional
VITE_APP_TITLE=GeoCetak
VITE_API_TIMEOUT=10000
VITE_ENABLE_ANALYTICS=true
```

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: 'esnext',
    sourcemap: true
  }
})
```

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Development Workflow
```bash
# Setup
git clone <repo>
npm install
npm run dev

# Before commit
npm run lint:fix
npm run type-check
npm test
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Support

- 📧 Email: support@geocetak.com
- 💬 Discord: [GeoCetak Community](https://discord.gg/geocetak)
- 📖 Docs: [docs.geocetak.com](https://docs.geocetak.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/geocetak-web/issues)

---

## 🎯 Roadmap

### Phase 1 (Current - MVP) ✅
- ✅ Authentication system
- ✅ Basic 3D interactions
- ✅ Tabung module complete
- ✅ Gamification basics

### Phase 2 (Next - Complete Curriculum) 🚧
- ⏳ Kerucut & Bola modules
- ⏳ Net animations for all geometries
- ⏳ AI essay evaluation
- ⏳ 3D model export (GLB to STL)

### Phase 3 (Future - Advanced Features) 📅
- 📅 Teacher dashboard
- 📅 Classroom management
- 📅 Advanced analytics
- 📅 AR/VR integration

---

**Made with ❤️ for Indonesian Education**

🎓 Transforming Geometry Learning through Interactive 3D Experiences