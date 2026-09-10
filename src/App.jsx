import { useState } from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import MainContent from './components/MainContent/MainContent'
import ShaderBackground from './components/MainContent/ShaderBackground'

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="text-on-surface h-screen w-screen overflow-hidden flex font-body-md relative">
      <ShaderBackground />
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} onClose={closeSidebar} />
      <MainContent onToggleSidebar={toggleSidebar} />
    </div>
  )
}