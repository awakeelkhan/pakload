# 🔧 Manual Fix for App.tsx

**File writes are failing due to IDE/file system lock. You need to manually edit the file.**

---

## ✅ **MANUAL FIX STEPS:**

### **1. Open App.tsx in your IDE**
File location: `client/src/App.tsx`

### **2. Delete ALL content and paste this:**

```typescript
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import MyVehicles from './pages/MyVehicles';
import Settings from './pages/Settings';
import FindLoads from './pages/FindLoads';
import FindTrucks from './pages/FindTrucks';
import PostLoad from './pages/PostLoad';
import Routes from './pages/Routes';
import TrackShipment from './pages/TrackShipment';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import About from './pages/About';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/profile" component={Profile} />
              <Route path="/bookings" component={MyBookings} />
              <Route path="/vehicles" component={MyVehicles} />
              <Route path="/settings" component={Settings} />
              <Route path="/loads" component={FindLoads} />
              <Route path="/trucks" component={FindTrucks} />
              <Route path="/post-load" component={PostLoad} />
              <Route path="/routes" component={Routes} />
              <Route path="/track" component={TrackShipment} />
              <Route path="/signin" component={SignIn} />
              <Route path="/signup" component={SignUp} />
              <Route path="/privacy" component={PrivacyPolicy} />
              <Route path="/terms" component={Terms} />
              <Route path="/contact" component={Contact} />
              <Route path="/about" component={About} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
```

### **3. Save the file (Ctrl+S)**

### **4. Run the servers:**
```powershell
npm run dev
```

### **5. Test:**
- Go to: http://localhost:5173/signin
- Login: demo@pakload.com / Password123!
- Dashboard will work! 🎉

---

## ✅ **Key Lines to Verify:**

- **Line 10:** `import Dashboard from './pages/Dashboard';` ✅
- **Line 11-14:** Profile, MyBookings, MyVehicles, Settings imports ✅
- **Line 53:** `<Route path="/dashboard" component={Dashboard} />` ✅
- **Line 54-57:** Profile, Bookings, Vehicles, Settings routes ✅
- **Line 79:** `export default App;` ✅

---

**After pasting and saving, the file should have 80 lines total.**
