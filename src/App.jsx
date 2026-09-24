import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ShaderBackground from './components/MainContent/ShaderBackground';
import TopBar from './components/MainContent/TopBar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import UsagePage from './pages/UsagePage';
import { ConfirmModalProvider } from './context/ConfirmModalProvider';
import { useFaviconTheme } from './hooks/useFaviconTheme';

function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const role = useSelector((state) => state.auth.user?.role);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/chat/new" replace />;
  return children;
}

function ChatLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="text-on-surface h-screen w-screen overflow-hidden flex font-body-md relative">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} onClose={closeSidebar} />
      <div className="flex-1 min-w-0 h-full flex flex-col relative overflow-hidden">
        <TopBar onToggleSidebar={toggleSidebar} />
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  // Favicon mengikuti tema aktif (terang → permata.svg, gelap → logodark.png).
  useFaviconTheme();

  return (
    <ConfirmModalProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth pages — standalone, tanpa sidebar */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Chat pages — dilindungi, dengan sidebar */}
          <Route element={<ProtectedRoute><ChatLayout /></ProtectedRoute>}>
            <Route path="/chat/:id" element={<ChatPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/usage" element={<UsagePage />} />
          </Route>

          {/* Admin panel — khusus role:admin, dengan sidebar */}
          <Route element={<AdminRoute><ChatLayout /></AdminRoute>}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/chat/new" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfirmModalProvider>
  );
}