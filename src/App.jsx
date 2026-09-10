import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './components/Sidebar/Sidebar';
import MainContent from './components/MainContent/MainContent';
import ShaderBackground from './components/MainContent/ShaderBackground';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import { useState } from 'react';

function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <BrowserRouter>
      <div className="text-on-surface h-screen w-screen overflow-hidden flex font-body-md relative">
        <ShaderBackground />
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} onClose={closeSidebar} />
        <MainContent onToggleSidebar={toggleSidebar} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute><div className="flex-1 flex flex-col" /></ProtectedRoute>}>
            <Route path="/chat/:id" element={<ChatPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/chat/new" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}