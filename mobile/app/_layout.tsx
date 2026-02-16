import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/contexts/AuthContext';
import { LanguageProvider } from '../src/contexts/LanguageContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth/login" options={{ title: 'Sign In', headerShown: false }} />
            <Stack.Screen name="auth/register" options={{ title: 'Sign Up', headerShown: false }} />
            <Stack.Screen name="loads/[id]" options={{ title: 'Load Details' }} />
            <Stack.Screen name="bookings/[id]" options={{ title: 'Tracking' }} />
            <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
            <Stack.Screen name="bids" options={{ title: 'My Bids' }} />
          </Stack>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
