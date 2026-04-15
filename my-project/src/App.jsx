import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';

import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { AppProvider } from './contexts/AppContext';
import { router } from './routes';

function AppContent() {
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppProvider>
          <AppContent />
          <Toaster position="top-right" richColors />
        </AppProvider>
      </SocketProvider>
    </AuthProvider>
  );
}