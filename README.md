# 🚛 PakLoad - World-Class Logistics Platform

**The premier loadboard for China-Pakistan Economic Corridor (CPEC) freight**

A professional logistics platform connecting shippers and carriers across the Karakoram Highway, featuring real-time tracking, multi-language support, and verified carrier networks.

## 🌟 Features

### Core Functionality
- **Find Loads** - Advanced search and filtering for available cargo
- **Find Trucks** - Browse verified carriers with per-km rates
- **Post Load** - Multi-step wizard for posting shipments
- **Routes** - Interactive map of CPEC freight corridors
- **Track Shipment** - Real-time GPS tracking with milestone updates
- **Verification System** - Carrier verification badges and trust indicators

### Language Support
- 🇬🇧 **English** - Full interface translation
- 🇵🇰 **Urdu** - اردو میں مکمل انٹرفیس
- 🇨🇳 **Chinese** - 完整的中文界面

### Technical Features
- ⚡ Lightning-fast Vite build system
- 🎨 Modern UI with Tailwind CSS + shadcn/ui
- 📱 Fully responsive mobile design
- 🔐 Secure session-based authentication
- 🗄️ PostgreSQL database with Drizzle ORM
- 🌐 RESTful API architecture
- 📊 Real-time data with React Query

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- PostgreSQL 16+
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
cd pakload
npm install
```

2. **Set up environment variables**
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your database credentials
DATABASE_URL=postgresql://user:password@localhost:5432/pakload
SESSION_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
```

3. **Initialize database**
```bash
npm run db:push
```

4. **Start development server**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
pakload/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and helpers
│   │   └── i18n/          # Internationalization
│   │       ├── config.ts  # i18n configuration
│   │       └── locales/   # Translation files
│   │           ├── en.json
│   │           ├── ur.json
│   │           └── zh.json
├── server/                # Backend Express application
│   ├── routes/           # API route handlers
│   ├── db/               # Database configuration
│   └── index.ts          # Server entry point
├── shared/               # Shared types and schemas
└── package.json

```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Query** - Data fetching
- **Wouter** - Routing
- **i18next** - Internationalization
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **Drizzle ORM** - Database ORM
- **Express Session** - Authentication

## 🌍 Language Switching

Users can switch between languages using the language selector in the header. The selected language is persisted in localStorage.

```typescript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t, i18n } = useTranslation();
  
  // Change language
  i18n.changeLanguage('ur'); // or 'en', 'zh'
  
  // Use translations
  return <h1>{t('home.hero.title')}</h1>;
}
```

## 📦 Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio

## 🔐 Authentication

The platform uses session-based authentication with support for:
- Email/password login
- Carrier verification system
- Role-based access control (Shipper/Carrier)

## 🗺️ Key Routes

- `/` - Home page
- `/loads` - Find loads
- `/trucks` - Find trucks
- `/post-load` - Post a new load
- `/routes` - View freight routes
- `/track` - Track shipment

## 🎨 Design System

The platform follows a consistent design system with:
- **Primary Color**: Green (#16a34a) - Trust and growth
- **Typography**: Inter font family
- **Spacing**: 4px base unit
- **Border Radius**: 8px standard

## 📱 Mobile Support

Fully responsive design optimized for:
- Desktop (1920px+)
- Tablet (768px - 1919px)
- Mobile (320px - 767px)

## 🚢 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
Required for production:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret for session encryption
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Set to 'production'

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please read CONTRIBUTING.md for guidelines.

## 📞 Support

- Email: support@loadpak.com
- Phone: +92 51 123 4567
- Website: https://loadpak.com

---

Built with ❤️ for the China-Pakistan Economic Corridor
