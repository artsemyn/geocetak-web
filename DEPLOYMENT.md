# 🚀 Deployment Guide - GeoCetak Web

This guide will help you deploy GeoCetak to Vercel step by step.

## ✅ Prerequisites

- [Node.js](https://nodejs.org/) >= 18.0.0
- [Git](https://git-scm.com/) installed
- [GitHub](https://github.com/) account
- [Vercel](https://vercel.com/) account (free)
- [Supabase](https://supabase.com/) account (optional - app works without it)

## 📦 Quick Deploy (Recommended)

### Step 1: Fork/Clone the Repository

```bash
# Clone the repository
git clone <your-repository-url>
cd geocetak-web

# Install dependencies (uses legacy peer deps for compatibility)
npm install

# Test the build
npm run build
```

### Step 2: Deploy to Vercel via GitHub

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Environment Variables:**
   - In Vercel dashboard, go to "Settings" → "Environment Variables"
   - Add these variables:
     ```
     VITE_SUPABASE_URL = https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY = your_anon_key_here
     ```
   - Click "Save"

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-project.vercel.app`

## 🔧 Alternative: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
vercel

# Follow the prompts:
# ? Set up and deploy "~/geocetak-web"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? geocetak-web
# ? In which directory is your code located? ./

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

## 🔐 Environment Variables Setup

### Option 1: With Supabase (Full Features)

If you want user authentication and database features:

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Set Environment Variables:**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Option 2: Without Database (Static Mode)

The app works perfectly without Supabase using static data:

```env
# Leave these empty or omit them entirely
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## 📊 Vercel Configuration

The project includes a `vercel.json` file with optimized settings:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": { "cache-control": "public, immutable, max-age=31536000" }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 🚀 Build Configuration

### Build Scripts:
- `npm run build` - Production build (skips type checking for faster deployment)
- `npm run build:check` - Build with TypeScript type checking
- `npm run type-check` - Type checking only
- `npm run preview` - Preview production build locally

### Build Output:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].css
│   ├── react-vendor-[hash].js
│   ├── ui-vendor-[hash].js
│   ├── 3d-vendor-[hash].js
│   └── supabase-vendor-[hash].js
```

## 🔍 Troubleshooting

### Common Issues:

1. **Build Fails with Dependency Conflicts:**
   ```bash
   # The project includes .npmrc with legacy-peer-deps=true
   # If you still have issues, try:
   npm install --legacy-peer-deps
   npm run build
   ```

2. **Build Fails with TypeScript Errors:**
   ```bash
   # Use the regular build (skips type checking)
   npm run build

   # Or fix type errors and use:
   npm run build:check
   ```

3. **Environment Variables Not Working:**
   - Make sure variables start with `VITE_`
   - Redeploy after adding environment variables
   - Check Vercel dashboard for typos

4. **Routing Issues (404 on refresh):**
   - Vercel configuration in `vercel.json` handles this automatically
   - Ensure the routes configuration is correct

5. **Large Bundle Size Warnings:**
   - Normal for 3D applications
   - Bundle is optimized with code splitting
   - Gzip compression reduces actual transfer size

### Performance Optimization:

- ✅ Automatic code splitting by vendor
- ✅ Asset caching headers
- ✅ Gzip compression
- ✅ React Three Fiber optimization
- ✅ Material-UI tree shaking

## 🌐 Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to "Settings" → "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

2. **DNS Configuration:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.19.61
   ```

## 📈 Monitoring

### Vercel Analytics:
- Automatic performance monitoring
- Real user metrics
- Core Web Vitals tracking

### Logs:
```bash
# View deployment logs
vercel logs your-deployment-url

# View function logs
vercel logs --follow
```

## ✅ Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] All routes work (/, /modules, /module/tabung, etc.)
- [ ] 3D models render properly
- [ ] Authentication works (if Supabase configured)
- [ ] Mobile responsive design
- [ ] Performance is acceptable (< 3s load time)

## 🔄 Automatic Deployments

Once connected to GitHub, Vercel automatically:
- Deploys on every push to main branch
- Creates preview deployments for pull requests
- Runs build checks before deployment
- Provides deployment status updates

## 🆘 Support

If you encounter issues:

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review build logs in Vercel dashboard
3. Test build locally: `npm run build && npm run preview`
4. Create issue in project repository

---

**🎉 Congratulations! Your GeoCetak app is now live!**

Share your deployment URL and start teaching 3D geometry! 🚀